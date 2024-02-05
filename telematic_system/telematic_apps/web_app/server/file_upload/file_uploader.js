const formidable = require("formidable");
const { uploadToS3 } = require("./s3_uploader");
const uploadDest = process.env.UPLOAD_DESTINATION;
const uploadDestPath = process.env.UPLOAD_DESTINATION_PATH;
const options = {
  maxFileSize: 20 * 1024 * 1024 * 1024, //20 GBs converted to bytes,
  maxTotalFileSize: 20 * 1024 * 1024 * 1024, //20 GBs converted to bytes,
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
    const form = formidable(options);
    const nc = await CreateNatsConn();
    const listener = new FileUploadStatusListener(UPLOADSTATUS.UNKNOWN);
    let totalFileCount = 0;
    let fileCount = 0;
    form.parse(req, (err, fields, files) => {
      let localFiles = files["files[]"];
      totalFileCount = localFiles.length ? localFiles.length : 1;
      //Send processing request for uploaded file to HOST
      if (uploadDest.trim().toLowerCase() !== "s3") {
        for (let index = 0; index < totalFileCount; index++) {
          let localFile = totalFileCount > 1 ? localFiles[index] : localFiles;
          updateFileUploadStatusEmitter(listener).emit(
            UPLOADSTATUS.COMPLETED,
            localFile
          );
          let processing_request = {
            filepath: localFile.filepath,
            uploaded_destination: uploadDest,
          };
          pub_file_processing_req(nc, JSON.stringify(processing_request));
        }
        nc.close();
      }
    });

    form
      .on("end", () => {
        if (uploadDest.trim().toLowerCase() !== "s3") {
          resolve({
            message: "File upload end.",
          });
        }
      })
      .on("error", (err) => {
        reject(err);
      })
      .on("abort", (err) => {
        reject(err);
      })
      .on("fileBegin", (formName, file) => {
        //Update upload status
        updateFileUploadStatusEmitter(listener).emit(
          UPLOADSTATUS.IN_PROGRESS,
          file.toJSON()
        );
        //Write stream into S3 bucket
        if (uploadDest.trim().toLowerCase() === "s3") {
          uploadToS3(file)
            .then((data) => {
              updateFileUploadStatusEmitter(listener).emit(
                UPLOADSTATUS.COMPLETED,
                data
              );
              let processing_request = {
                filepath: file.originalFilename,
                uploaded_destination: uploadDest,
              };
              pub_file_processing_req(nc, JSON.stringify(processing_request));
              resolve({
                message: " File uploaded to S3!!",
                data: data,
              });
              fileCount += 1;
              //Close NATS connection when all files are uploaded
              if (fileCount === totalFileCount) {
                nc.close();
              }
            })
            .catch((err) => {
              updateFileUploadStatusEmitter(listener).emit(
                UPLOADSTATUS.ERROR,
                err
              );
              reject(err);
              fileCount += 1;
              //Close NATS connection when all files are uploaded or failed
              if (fileCount === totalFileCount) {
                nc.close();
              }
            });
        } else {
          //Write file to HOST machine
          file.filepath = uploadDestPath + "/" + file.originalFilename;
        }
      }); //End fileBegin
  });
};
