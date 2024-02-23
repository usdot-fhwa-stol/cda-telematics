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
 * Description:
 * Provide functions to find a list of file_info from database table and S3 bucket.
 * 
 * - filterFiles: Query file_info database table based on input fields.
 * - listAllFiles: Query all file_info from database and S3 bucket depending on whether files are uploaded to S3 or not.
 * - listAllDBFiles: Query all file_info from database only.
 * - listAllDBFilesAndS3Objects: Query all file_info from both database and S3 bucket. 
 *   If the file exist in S3 bucket but not in database, insert the file metadata into file_info database table.
 *   If the file exist in both S3 bucket and database, ignore files in S3 bucket.
 * 
 * Revision:
 * Update file upload status to COMPLETE if files exist in S3 bucket but file metadata either does not exist in MYSQL DB or upload status is ERROR or IN_PROGRESS.
 */
const fileInfoController = require("../controllers/file_info.controller");
const listObjectsModule = require("../file_upload/s3_list_objects");
const {verifyToken} = require("../utils/verifyToken");
const { UPLOADSTATUS } = require("./file_upload_status_emitter");
require("dotenv").config();
const uploadDest = process.env.UPLOAD_DESTINATION;
const S3_USER = 1; //ToDo: User ID = 1 is admin user. S3 objects are temporarily assigned to admin user. 

const filterFiles = async (req_fields) => {
  try {
    return await fileInfoController.list(req_fields);
  } catch (err) {
    console.error("Cannot filter a list of DB files!");
    console.trace();
    throw err;
  }
};

const listAllFiles = async (req, res) => {
  try {
    if (uploadDest && uploadDest.trim().toLowerCase() === "s3") {
      return await listAllDBFilesAndS3Objects(req, res);
    } else {
      return await listAllDBFiles(req, res);
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const listAllDBFiles = async (req, res) => {
  try {
    let contents = [];
    //Get user organization name
    let currentFolder = verifyToken(req)?.org_name?.replaceAll(' ', '_');
    let data = await fileInfoController.list({});
    for (const d of data) {
      //Only push files of current folder (=user organization name)
      if (d.original_filename.includes(currentFolder)) {
        contents.push(d);
      }
    }
    return contents;
  } catch (err) {
    console.error("Cannot get a list of All DB files!");
    console.trace();
    throw err;
  }
};

const listAllDBFilesAndS3Objects = async (req, res) => {
  try {
    //Get user organization name
    let currentFolder = verifyToken(req)?.org_name?.replaceAll(' ', '_');
    let files = await fileInfoController.list({});
    console.log(files)
    //Get a list of objects from organization folder in MYSQL DB
    let contents = files.filter(file => file.original_filename.includes(currentFolder));
    //Get file names from current folder (= Current user organization name) and file upload status is completed
    let completedFileNames = files.filter(file => file.original_filename.includes(currentFolder) && file.upload_status === UPLOADSTATUS.COMPLETED).map(file => file.original_filename);    
    //Get a list of objects from organization folder in S3 bucket
    let objects = await listObjectsModule.listObjects(currentFolder);
    console.log("Your bucket contains the following objects:");
    console.log(objects);

    //Update database with the list of S3 Objects. By default, S3 objects upload status is COMPLETED.
    if (Array.isArray(objects)) {
      for (const object of objects) {
        if (!completedFileNames.includes(object.original_filename)) {
          let newFileFromS3 = { ...object, status: UPLOADSTATUS.COMPLETED, error: "" };
          console.log(
            "Below S3 object not found or shown error in MYSQL DB. Insert object into DB:"
          );
          newFileFromS3.created_by = S3_USER;
          newFileFromS3.updated_by = S3_USER;
          console.log(newFileFromS3);
          let newFile = await fileInfoController
            .upsertFileInfo(newFileFromS3)
            .catch((error) => console.log(error));
          let isUpdate = Array.isArray(newFile) && newFile.length > 0 && Number.isInteger(newFile[0]);
          console.log(newFile)
          isUpdate ? contents.filter(file => file.original_filename.includes(newFileFromS3.original_filename))[0].upload_status = UPLOADSTATUS.COMPLETED : contents.push(newFile);
        }
      }
    }
    return contents;
  } catch (err) {
    console.error("Cannot get a list of all DB files or S3 objects!");
    console.trace();
    throw err;
  }
};

module.exports = {
  listAllFiles,
  filterFiles,
  listAllDBFiles,
  listAllDBFilesAndS3Objects,
};
