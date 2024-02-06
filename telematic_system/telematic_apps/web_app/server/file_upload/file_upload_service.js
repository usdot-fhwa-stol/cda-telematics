const formidable = require("formidable");
const { uploadToS3 } = require("./s3_uploader");
const {
  updateFileDescription,
} = require("../controllers/file_info.controller");
const uploadDest = process.env.UPLOAD_DESTINATION;
const uploadDestPath = process.env.UPLOAD_DESTINATION_PATH;
const uploadMaxFileSize = parseInt(process.env.UPLOAD_MAX_FILE_SIZE);

const options = {
  maxFileSize: uploadMaxFileSize,
  maxTotalFileSize: uploadMaxFileSize,
  allowEmptyFiles: false,
  keepExtensions: true,
  multiples: true,
};
const {
  UPLOADSTATUS,
  updateFileUploadStatusEmitter,
  FileUploadStatusListener,
} = require("./file_upload_status_emitter");

const { CreateNatsConn } = require("../nats_client/nats_connection");
const {
  pub_file_processing_req,
} = require("../nats_client/file_processing_nats_publisher");

exports.uploadFile = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const NATSConn = await CreateNatsConn();
      const listener = new FileUploadStatusListener(UPLOADSTATUS.UNKNOWN);
      const form = formidable(options);
      form
        .on("error", (err) => {
          reject(err);
        })
        .on("abort", (err) => {
          reject(err);
        })
        .on("end", () => {
          resolve({
            message: "File upload end.",
          });
        });
      if (uploadDest.trim().toLowerCase() === "s3") {
        parseS3FileUpload(req, form, listener, NATSConn);
      } else {
        parseLocalFileUpload(req, form, listener, NATSConn);
      }
    } catch (error) {
      console.log(error);
      reject({
        error: error.message ? error.message : "Unknown server error.",
      });
    }
  });
}; //End upload file

/**
 * Parse files before uploading them to a pre-configured local folder
 * @param {*} req http request
 * @param {*} form Form data that includes the files
 * @param {*} listener File upload status listener to update DB with updated status
 * @param {*} NATSConn NATS connection to send processing file request
 */
const parseLocalFileUpload = async (req, form, listener, NATSConn) => {
  let totalFileCount = 0;
  form.parse(req, async (err, fields, files) => {
    let localFiles = files["files"];
    totalFileCount = localFiles.length ? localFiles.length : 1;
    let localFields = fields["fields"];
    let totalFieldsCnt =
      Array.isArray(localFields) && localFields.length ? localFields.length : 1;

    for (let index = 0; index < totalFileCount; index++) {
      let localFile = totalFileCount > 1 ? localFiles[index] : localFiles;

      //Populate file info with description field
      for (let fieldIdx = 0; fieldIdx < totalFieldsCnt; fieldIdx++) {
        let localField = JSON.parse(
          totalFieldsCnt === 1 ? localFields : localFields[fieldIdx]
        );
        if (
          localField.filename &&
          localField.description &&
          localField.filename === localFile.originalFilename
        ) {
          localFile.description = localField.description;
        }
      }

      //Update file info status
      updateFileUploadStatusEmitter(listener).emit(
        UPLOADSTATUS.COMPLETED,
        localFile
      );

      //Send processing request for uploaded file to HOST
      let processing_request = {
        filepath: localFile.filepath,
        uploaded_destination: uploadDest,
      };
      if (NATSConn) {
        await pub_file_processing_req(
          NATSConn,
          JSON.stringify(processing_request)
        );
      }
    }
    if (NATSConn) {
      await NATSConn.close();
    }
  });

  form.on("fileBegin", (formName, file) => {
    //Write file to HOST machine
    file.filepath = uploadDestPath + "/" + file.originalFilename;
  });
};

/**
 * Parse files before uploading them to S3 bucket
 * @param {*} req http request
 * @param {*} form Form data that includes the files
 * @param {*} listener File upload status listener to update DB with updated status
 * @param {*} NATSConn NATS connection to send processing file request
 */
const parseS3FileUpload = async (req, form, listener, NATSConn) => {
  let fileCount = 0;
  let totalFileCount = 0;
  let localFields = {};
  let totalFieldsCnt = 0;
  form.parse(req, async (err, fields, files) => {
    let localFiles = files["files"];
    totalFileCount = localFiles.length ? localFiles.length : 1;
    localFields = fields["fields"];
    totalFieldsCnt =
      Array.isArray(localFields) && localFields.length ? localFields.length : 1;
  });

  form.on("fileBegin", async (formName, file) => {
    //Update upload status
    updateFileUploadStatusEmitter(listener).emit(
      UPLOADSTATUS.IN_PROGRESS,
      file.toJSON()
    );
    //Write stream into S3 bucket
    await uploadToS3(file)
      .then(async (data) => {
        //Populate file info description
        for (let fieldIdx = 0; fieldIdx < totalFieldsCnt; fieldIdx++) {
          let localField = JSON.parse(localFields[fieldIdx]);
          if (localField.filename === data.originalFilename) {
            data.description = localField.description;
          }
        }
        //Update file upload status
        updateFileUploadStatusEmitter(listener).emit(
          UPLOADSTATUS.COMPLETED,
          data
        );

        //Send file process request to NATS
        let processing_request = {
          filepath: file.originalFilename,
          uploaded_destination: uploadDest,
        };
        if (NATSConn) {
          await pub_file_processing_req(
            NATSConn,
            JSON.stringify(processing_request)
          );
        }

        //Close NATS connection when all files are uploaded
        fileCount += 1;
        if (fileCount === totalFileCount && NATSConn) {
          await NATSConn.close();
        }
        return {
          message: " File uploaded to S3!!",
          data: data,
        };
      })
      .catch(async (err) => {
        updateFileUploadStatusEmitter(listener).emit(UPLOADSTATUS.ERROR, err);
        //Close NATS connection when all files are uploaded or failed
        fileCount += 1;
        if (fileCount === totalFileCount) {
          await NATSConn.close();
        }
        throw new Error(err);
      });
  }); //End fileBegin
};
