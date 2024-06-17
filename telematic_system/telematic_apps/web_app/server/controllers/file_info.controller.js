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
const { Op } = require("sequelize");
const { file_info, user } = require("../models");

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
      include: [
        {
          model: user,
          attributes: ["id", "name", "org_id", "email", "login"],
        },
      ],
    })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.error("Error findAll file info from MYSQL DB!");
      throw err;
    });
};

exports.updateDescription = async (updatedFileInfo) => {
  let originalFilename =
    updatedFileInfo.originalFilename ||
    updatedFileInfo.original_filename ||
    undefined;

  if (!originalFilename) {
    throw new Error("originalFilename cannot be undefined");
  }

  let condition = { original_filename: originalFilename };
  let fileInfoArray = await file_info.findAll({
    where: condition,
  });

  if (Array.isArray(fileInfoArray) && fileInfoArray.length > 0) {
    let fileInfo = fileInfoArray[0];
    fileInfo.description = updatedFileInfo.description;
    return await fileInfo.save();
  }
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
    created_by: fileInfo.created_by,
    user_id: fileInfo.created_by,
    updated_by: fileInfo.updated_by,
  };
  if (fileInfo.error) {
    fileInfoLocal.upload_error_msg = JSON.stringify(fileInfo.error);
  }
  if (fileInfo.size) {
    fileInfoLocal.size = fileInfo.size;
  }
  if (fileInfo.status) {
    fileInfoLocal.upload_status = fileInfo.status;
  }
  if (fileInfo.filepath) {
    fileInfoLocal.content_location = fileInfo.filepath;
  }
  if (fileInfo.description) {
    fileInfoLocal.description = fileInfo.description;
  }
  let condition = { original_filename: originalFilename };
  return await file_info
    .upsert(fileInfoLocal, condition)
    .then(async (data) => {
      return data[0];
    })
    .catch((err) => {
      throw new Error("Error updating file info record: " + err);
    });
};

exports.findByFilenames = async (filenames) => {
  return await file_info
    .findOne({
      where: {
        original_filename: {
          [Op.in]: filenames,
        },
      },
    })
    .then((data) => {
      console.log(data);
      return data;
    })
    .catch((err) => {
      console.log(err);
      throw new Error("Error find all files by filenames");
    });
};
