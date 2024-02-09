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
 * Provide functions to query and update to file_info database table.
 * 
 * - list: Query file info by input fields, and return a list of filtered file_info result.
 * - upsertFileInfo: Update the file_info table based on the unique filename if file_info exist in the database table, and return the number
 * of records updated. Otherwise, insert a new file_info record into the database table and return the new record. 
 */
const { file_info } = require("../models");

/**
 * Query a list of file info from DB based on filters.
 * @param {*} filterFields Filter conditions
 */
exports.list = (filterFields) => {
  if (!filterFields) {
    throw new Error("Content cannot be undefined");
  }
  let condition = {};
  if (filterFields.original_filename) {
    condition.original_filename = filterFields.original_filename;
  }

  if (filterFields.description) {
    condition.description = filterFields.description;
  }

  return file_info
    .findAll({
      where: condition,
      order: [["updated_at", "DESC"]],
    })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.error("Error findAll file info from MYSQL DB!");
      throw err;
    });
};

/**
 * Create or update file info record in DB table
 * @param {*} file_info JSON object
 * e.g: {"size":0,"filepath":"/tmp/88734e92ec45dd40452a9a500.py","newFilename":"<filename>","mimetype":"text/x-python","mtime":null,"originalFilename":"<filename>"}
 * If update, return updated number of record. If insert, return inserted record.
 */
exports.upsertFileInfo = async (fileInfo) => {
  let originalFilename =
    fileInfo.originalFilename || fileInfo.original_filename || undefined;
  if (!originalFilename) {
    throw new Error("originalFilename cannot be undefined");
  }
  if (!(fileInfo.updated_by && fileInfo.created_by)) {
    throw new Error("user cannot be undefined");
  }
  let fileInfoLocal = {
    original_filename: originalFilename,
    content_location: fileInfo.filepath,
    upload_status: fileInfo.status || null,
    upload_error_msg: fileInfo.error ? JSON.stringify(fileInfo.error) : null,
    size: fileInfo.size || null,
    created_by: fileInfo.created_by,
    updated_by: fileInfo.updated_by,
  };
  if (fileInfo.description) {
    fileInfoLocal.description = fileInfo.description;
  }
  let condition = { original_filename: originalFilename };
  return await file_info
    .findAll({
      where: condition,
    })
    .then(async (data) => {
      if (data.length > 0) {
        return await file_info
          .update(fileInfoLocal, {
            where: condition,
          })
          .then((num) => {
            return num;
          });
      } else {
        return await file_info.create(fileInfoLocal).then((data) => {
          return {
            content_location: data.content_location,
            created_at: data.created_at,
            updated_at: data.updated_at,
            id: data.id,
            original_filename: data.original_filename,
            upload_status: data.upload_status,
            upload_error_msg: data.upload_error_msg,
            size: data.size,
            created_by: data.created_by,
            updated_by: data.updated_by,
            description: data.description,
          };
        });
      }
    })
    .catch((err) => {
      throw new Error("Error updating file info record: " + err);
    });
};
