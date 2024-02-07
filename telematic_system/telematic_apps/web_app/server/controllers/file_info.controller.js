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
const { file_info } = require("../models");
const ADMIN_ID = 1;

/**
 * List file info
 * @param {*} filterFields Filter conditions
 */
exports.list = (filterFields) => {
  if (!filterFields) {
    throw new Error("Content cannot be undefined");
  }
  let condition = {};
  if (filterFields.original_filename)
    condition.original_filename = filterFields.original_filename;
  if (filterFields.description)
    condition.description = filterFields.description;
  return file_info
    .findAll({
      where: condition,
      order: [["updated_at", "DESC"]],
    })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      throw err;
    });
};

exports.updateFileDescription = async (originalFilename, description) => {
  if (!originalFilename) {
    throw new Error("originalFilename cannot be undefined");
  }
  let condition = {};
  condition.original_filename = originalFilename;
  return await file_info
    .findAll({
      where: condition,
      order: [["updated_at", "DESC"]],
    })
    .then(async (data) => {
      if (data.length > 0) {
        let updated_file = {
          id: data.id,
          description: description,
        };
        return await file_info
          .update(updated_file, {
            where: condition,
          })
          .then((num) => {
            return num;
          });
      }
      console.warn(
        `Warning: Cannot update description as file [ ${original_filename} ] does not exist!`
      );
      return data;
    })
    .catch((err) => {
      console.log(err);
      return {
        errorMsg:
          err.message ||
          "Error while updating description of uploaded files in MYSQL DB.",
      };
    });
};

/**
 * Create or update file info record in table
 * @param {*} file_info
 * e.g: {"size":0,"filepath":"/tmp/88734e92ec45dd40452a9a500.py","newFilename":"bsmscript.py","mimetype":"text/x-python","mtime":null,"originalFilename":"bsmscript.py"}
 * Return update success or not. True success, otherwise false.
 */
exports.upsertFileInfo = async (fileInfo) => {
  let original_filename =
    fileInfo.originalFilename || fileInfo.original_filename || undefined;
  if (!original_filename) {
    throw new Error(
      "original_filename cannot be undefined"
    );
  }
  let fileInfoLocal = {
    original_filename:original_filename,
    content_location: fileInfo.filepath,
    upload_status: fileInfo.status ? fileInfo.status : null,
    upload_error_msg: fileInfo.error ? JSON.stringify(fileInfo.error) : null,
    size: fileInfo.size ? fileInfo.size : null,
    created_by: fileInfo.created_by ? fileInfo.created_by : ADMIN_ID,
    updated_by: fileInfo.updated_by ? fileInfo.updated_by : ADMIN_ID,
  };
  if (fileInfo.description) {
    fileInfoLocal.description = fileInfo.description;
  }
  let condition = { original_filename: original_filename };
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
