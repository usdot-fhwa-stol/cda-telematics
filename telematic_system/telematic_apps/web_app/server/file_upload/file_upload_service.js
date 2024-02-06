/*
 * Copyright (C) 2019-2024 LEIDOS.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
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
  keepExtensions: false,
  multiples: true,
  uploadDir: uploadDestPath,
};
const {
  UPLOADSTATUS,
  updateFileUploadStatusEmitter,
  FileUploadStatusListener,
} = require("./file_upload_status_emitter");

const { CreateNatsConn } = require("../nats_client/nats_connection");
const {
  pubFileProcessingReq,
} = require("../nats_client/file_processing_nats_publisher");

/**
 * Parse files and upload them to defined destination
 * @param {*} req Upload file request
 * @returns Promise with upload result
 */
exports.uploadFile = async (req) => {
  try {
    const NATSConn = await CreateNatsConn();
    return await new Promise((resolve, reject) => {
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
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
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
    totalFileCount =
      Array.isArray(localFiles) && localFiles.length ? localFiles.length : 1;
    let formFields = fields["fields"];
    let totalFieldsCnt =
      Array.isArray(formFields) && formFields.length ? formFields.length : 1;

    for (let index = 0; index < totalFileCount; index++) {
      let localFile = totalFileCount > 1 ? localFiles[index] : localFiles;

      //Populate file info with description field
      updateFileInfoWithDescription(formFields, totalFieldsCnt, localFile);

      //Update file info status
      updateFileUploadStatusEmitter(listener).emit(
        UPLOADSTATUS.COMPLETED,
        localFile
      );

      //Send processing request for uploaded file to HOST
      let processingReq = {
        filepath: data.filepath,
        filename: data.originalFilename,
        uploaded_destination: uploadDest,
      };
      if (NATSConn) {
        await pubFileProcessingReq(NATSConn, JSON.stringify(processingReq));
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
  let formFields = [];
  let totalFieldsCnt = 0;
  form.parse(req, async (err, fields, files) => {
    let localFiles = files["files"];
    totalFileCount =
      Array.isArray(localFiles) && localFiles.length ? localFiles.length : 1;
    formFields = fields["fields"];
    totalFieldsCnt =
      Array.isArray(formFields) && formFields.length ? formFields.length : 1;
  });

  form.on("fileBegin", async (formName, file) => {
    //Update upload status
    updateFileUploadStatusEmitter(listener).emit(
      UPLOADSTATUS.IN_PROGRESS,
      file.toJSON()
    );
    //Write stream into S3 bucket
    await uploadToS3(file)
      .then((data) => {
        //Populate file info description
        updateFileInfoWithDescription(formFields, totalFieldsCnt, data);
        //Update file upload status
        updateFileUploadStatusEmitter(listener).emit(
          UPLOADSTATUS.COMPLETED,
          data
        );

        //Send file process request to NATS
        let processingReq = {
          filepath: data.filepath,
          filename: data.originalFilename,
          uploaded_destination: uploadDest,
        };
        if (NATSConn) {
          pubFileProcessingReq(NATSConn, JSON.stringify(processingReq));
        }

        //Close NATS connection when all files are uploaded
        fileCount += 1;
        if (fileCount === totalFileCount && NATSConn) {
          NATSConn.close();
        }
      })
      .catch((err) => {
        updateFileUploadStatusEmitter(listener).emit(UPLOADSTATUS.ERROR, err);
        //Close NATS connection when all files are uploaded or failed
        fileCount += 1;
        if (fileCount === totalFileCount) {
          NATSConn.close();
        }
        console.log("Cannot upload file to S3 bucket due to error!");
        console.trace();
        console.log(err);
      });
  }); //End fileBegin
};

const updateFileInfoWithDescription = (fields, totalFieldsCnt, fileInfo) => {
  try {
    for (let fieldIdx = 0; fieldIdx < totalFieldsCnt; fieldIdx++) {
      let localField = JSON.parse(
        totalFieldsCnt === 1 ? fields : fields[fieldIdx]
      );
      if (
        localField.filename &&
        localField.description &&
        localField.filename === fileInfo.originalFilename
      ) {
        fileInfo.description = localField.description;
      }
    }
  } catch (error) {
    console.log(
      "Cannot update file info with description from fields: " + fields
    );
    console.trace();
    throw error;
  }
};
