const { file_info, Sequelize } = require("../models");
const { Op } = Sequelize;

/**
 * List file info
 * @param {*} JSON Filter condition
 */
exports.findAll = (condition) => {
  events
    .findAll({
      where: condition,
    })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return {
        message: err.message || "Error while findAll uploaded files metadata.",
      };
    });
};

/**
 * Create or update file info record in table
 * @param {*} file_info
 * Return update success or not. True success, otherwise false.
 */
exports.upsertFileInfo = (fileInfo) => {
  return new Promise((resolve, reject) => {
    file_info
      .upsert(file_info, {
        where: { id: fileInfo.id },
      })
      .then((num) => {
        if (num == 1) {
          return resolve("success");
        } else {
          return reject(new Error("Error updating file info record with id"));
        }
      })
      .catch((err) => {
        return reject(
          new Error("Error updating file info record with id = " + err)
        );
      });
  });
};
