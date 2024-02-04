const { file_info } = require("../models");

/**
 * List file info
 * @param {*} req_fields Filter conditions
 */
exports.list = async (req_fields, res) => {
  if (!req_fields) {
    res.writeHead(400);
    return {
      message: "Content cannot be empty.",
    };
  }
  let condition = {};
  if (req_fields.filename) condition.original_filename = req_fields.filename;
  if (req_fields.description) condition.description = req_fields.description;
  return await file_info
    .findAll({
      where: condition,
      order: [["updated_at", "DESC"]],
    })
    .then((data) => {
      if (!data || data.length === 0) {
        res.writeHead(404);
        return {
          message: "there is no uploaded files metadata.",
        };
      } else {
        res.writeHead(200);
        return data;
      }
    })
    .catch((err) => {
      res.writeHead(500);
      return {
        message: err.message || "Error while findAll uploaded files metadata.",
      };
    });
};

/**
 * Create or update file info record in table
 * @param {*} file_info
 * e.g: {"size":0,"filepath":"/tmp/88734e92ec45dd40452a9a500.py","newFilename":"bsmscript.py","mimetype":"text/x-python","mtime":null,"originalFilename":"bsmscript.py"}
 * Return update success or not. True success, otherwise false.
 */
exports.upsertFileInfo = (fileInfo) => {
  return new Promise((resolve, reject) => {
    let fileInfoLocal = {
      original_filename: fileInfo.originalFilename,
      content_location: fileInfo.filepath,
      upload_status: fileInfo.status ? fileInfo.status : null,
      upload_error_msg: fileInfo.error ? JSON.stringify(fileInfo.error) : null,
      size: fileInfo.size ? fileInfo.size : null,
      created_by: fileInfo.created_by ? fileInfo.created_by : 1,
      updated_by: fileInfo.updated_by ? fileInfo.updated_by : 1,
      description: fileInfo.description ? fileInfo.description : null,
    };
    let condition = { original_filename: fileInfo.originalFilename };
    file_info
      .findAll({
        where: condition,
      })
      .then((data) => {
        if (data.length > 0) {
          file_info.update(fileInfoLocal, {
            where: condition,
          });
        } else {
          file_info.create(fileInfoLocal);
        }
        return resolve("success");
      })
      .catch((err) => {
        return reject(
          new Error("Error updating file info record with id = " + err)
        );
      });
  });
};
