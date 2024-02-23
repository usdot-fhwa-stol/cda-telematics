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
 *
 *
 * Description: Parse file upload request, and upload files to S3 bucket or copy to a local dedicated folder depending on whether uploading to S3 or local.
 *
 * - uploadFile: Parse files and upload them to defined destination.
 * - parseLocalFileUpload: Parse files before uploading them to a pre-configured local folder
 * - parseS3FileUpload: Parse files before uploading them to S3 bucket
 * 
 * Revision:
 * - Update parseLocalFileUpload() and parseS3FileUpload() to use async/await to make sure the NATS request is sent before closing the NATS connection.
 */
const formidable = require("formidable");
const { uploadToS3 } = require("./s3_uploader");
require("dotenv").config();
const fs = require('fs');
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

const natsConnModule = require("../nats_client/nats_connection");
const {
  pubFileProcessingReq,
} = require("../nats_client/file_processing_nats_publisher");
const { verifyToken } = require("../utils/verifyToken");
const { updateDescription, bulkUpdateDescription } = require("../controllers/file_info.controller");

/**
 * Parse files and upload them to defined destination
 * @param {*} req Upload file request
 * @returns Promise with upload result
 */
exports.uploadFile = async (req) => {
  try {
    const NATSConn = await natsConnModule.createNatsConn();
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
    console.error(error);
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
  let userInfo = verifyToken(req);
  let trackingInProgressFiles = [];
  form.parse(req, async (err, fields, files) => {
    //If error occurs, save error messages.
    if (err) {
      handleFormError(err, trackingInProgressFiles, userInfo, listener);
      return;
    }

    //If no error, continue
    if (!(fields && files) || Object.keys(fields).length === 0 || Object.keys(files).length === 0) {
      console.error("Files or fields cannot be empty!");
      return;
    }
    let totalFiles = files["files"];
    totalFiles = Array.isArray(totalFiles) ? totalFiles : [totalFiles];
    let formFields = fields["fields"];
    formFields = Array.isArray(formFields) ? formFields : [formFields];
    //Populate file info with description field
    updateFileInfoWithDescription(formFields, userInfo);

    for (let localFile of totalFiles) {
      localFile.updated_by = userInfo.id;
      localFile.created_by = userInfo.id;

      //Update file info status
      updateFileUploadStatusEmitter(listener).emit(
        UPLOADSTATUS.COMPLETED,
        localFile
      );
      try {
        //Send processing request for uploaded file to HOST
        let processingReq = {
          filepath: uploadDestPath + "/" + localFile.originalFilename,
        };
        if (NATSConn) {
          await pubFileProcessingReq(NATSConn, processingReq);
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (NATSConn) {
      NATSConn.close();
    }
  });

  form.on("fileBegin", (formName, file) => {
    //Update file name prefix with folder name (= organization name) to be consistent with s3 originalFilename
    file.originalFilename = getUpdatedOrgFileName(file.originalFilename, userInfo);
    //create folder with org name if does not already exist
    let uploadFolder = uploadDestPath + "/" + userInfo.org_name.replaceAll(' ', '_');
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder);
    }
    file.updated_by = userInfo.id;
    file.created_by = userInfo.id;
    //Update file info status
    updateFileUploadStatusEmitter(listener).emit(
      UPLOADSTATUS.IN_PROGRESS,
      file
    );
    trackingInProgressFiles.push(file);
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
  let totalFiles = [];
  let formFields = [];
  let userInfo = verifyToken(req);
  let trackingInProgressFiles = [];
  form.parse(req, async (err, fields, files) => {
    //If error occurs, save error messages.
    if (err) {
      handleFormError(err, trackingInProgressFiles, userInfo, listener);
      return;
    }

    //If no error, continue
    if (!(fields && files) || Object.keys(fields).length === 0 || Object.keys(files).length === 0) {
      console.error("Files or fields cannot be empty!");
      return;
    }
    totalFiles = files["files"];
    totalFiles = Array.isArray(totalFiles) ? totalFiles : [totalFiles];
    formFields = fields["fields"];
    formFields = Array.isArray(formFields) ? formFields : [formFields];
    updateFileInfoWithDescription(formFields, userInfo);
  });

  form.on("fileBegin", async (formName, file) => {
    //Get user org name and file is uploaded to organization folder in S3 bucket
    file.originalFilename = getUpdatedOrgFileName(file.originalFilename, userInfo);
    //Update upload status
    updateFileUploadStatusEmitter(listener).emit(
      UPLOADSTATUS.IN_PROGRESS,
      { ...file.toJSON(), created_by: userInfo.id, updated_by: userInfo.id }
    );
    trackingInProgressFiles.push(file);
    //Write stream into S3 bucket
    await uploadToS3(file)
      .then(async (data) => {
        //Update file upload status
        data = { ...data, created_by: userInfo.id, updated_by: userInfo.id };
        updateFileUploadStatusEmitter(listener).emit(
          UPLOADSTATUS.COMPLETED,
          data
        );

        //Send file process request to NATS
        let processingReq = {
          filepath: uploadDestPath + "/" + data.originalFilename,
        };
        if (NATSConn) {
          await pubFileProcessingReq(NATSConn, processingReq);
        }

        //Close NATS connection when all files are uploaded
        fileCount += 1;
        if (fileCount === totalFiles.length && NATSConn) {
          NATSConn.close();
        }
      })
      .catch((err) => {
        err = { ...err, created_by: userInfo.id, updated_by: userInfo.id };
        updateFileUploadStatusEmitter(listener).emit(UPLOADSTATUS.ERROR, err);
        //Close NATS connection when all files are uploaded or failed
        fileCount += 1;
        if (fileCount === totalFiles.length) {
          NATSConn.close();
        }
        console.log("Cannot upload file to S3 bucket due to error!");
        console.trace();
        console.log(err);
      });
  }); //End fileBegin
};

const handleFormError = (err, trackingInProgressFiles, userInfo, listener) => {
  for (let beginFile of trackingInProgressFiles) {
    updateFileUploadStatusEmitter(listener).emit(
      UPLOADSTATUS.ERROR,
      { ...beginFile, error: err?.message, created_by: userInfo.id, updated_by: userInfo.id }
    );
  }
}

const updateFileInfoWithDescription = (fields, userInfo) => {
  try {
    console.log("Update description from fields: " + fields);
    for (let field of fields) {
      let localField = JSON.parse(field);
      if (
        localField.filename &&
        localField.description
      ) {
        localField.originalFilename = getUpdatedOrgFileName(localField.filename, userInfo);
        updateDescription(localField)
      }
    }
  } catch (error) {
    console.log("Cannot update file info with description from fields: " + fields);
    console.log(error)
    console.trace();
  }
};

const getUpdatedOrgFileName = (originalFilename, userInfo) => {
  return userInfo.org_name.replaceAll(' ', '_') + "/" + originalFilename;
}