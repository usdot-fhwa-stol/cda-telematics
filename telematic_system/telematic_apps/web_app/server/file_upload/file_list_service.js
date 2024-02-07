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
const fileInfoController = require("../controllers/file_info.controller");
const listObjectsModule = require("../file_upload/s3_list_objects");
const { UPLOADSTATUS } = require("./file_upload_status_emitter");
const uploadDest = process.env.UPLOAD_DESTINATION;

const filterFiles = async (req_fields) => {
  try {
    return await fileInfoController.list(req_fields);
  } catch (err) {
    console.log("Cannot filter a list of DB files!");
    console.trace();
    throw err;
  }
};

const listAllFiles = async () => {
  try {
    if (uploadDest && uploadDest.trim().toLowerCase() === "s3") {
      return await listAllDBFilesAndS3Objects();
    } else {
      return await listAllDBFiles();
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const listAllDBFiles = async () => {
  try {
    return await fileInfoController.list({});
  } catch (err) {
    console.log("Cannot get a list of All DB files!");
    console.trace();
    throw err;
  }
};

const listAllDBFilesAndS3Objects = async () => {
  try {
    let contents = [];
    let existingFileNames = [];
    let data = await fileInfoController.list({});
    contents.push(...data);
    for (const d of data) {
      existingFileNames.push(d.original_filename);
    }

    let objects = await listObjectsModule.listObjects();
    console.log("Your bucket contains the following objects:");
    console.log(objects);

    //Update database with the list of S3 Objects
    if (Array.isArray(objects)) {
      for (const object of objects) {
        if (!existingFileNames.includes(object.original_filename)) {
          let newFileFromS3 = { ...object, status: UPLOADSTATUS.COMPLETED };
          console.log(
            "Below S3 object not found in MYSQL DB. Insert object into DB:"
          );
          console.log(newFileFromS3);
          let newFile = await fileInfoController
            .upsertFileInfo(newFileFromS3)
            .catch((error) => console.log(error));
          contents.push(newFile);
          console.log(newFile);
        }
      }
    }
    return contents;
  } catch (err) {
    console.log("Cannot get a list of all DB files or S3 objects!");
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
