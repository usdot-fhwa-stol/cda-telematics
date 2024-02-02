const file_info_controller = require("../controllers/file_info.controller");

/**
 * List of possible file upload status
 */
const UPLOADSTATUS = {
  UNKNOWN: "UNKNOWN",
  IN_PROGRESS: "IN_PROGRESS",
  ERROR: "ERROR",
  COMPLETED: "COMPLETED",
};

const EventEmitter = require("node:events");

/***
 * Listen to file update status event and update the updated file status into DB table.
 */
class FileUploadStatusListener {
  constructor(status) {
    this.status = status;
  }

  /***
   * FileInfo dictionary:
   * e.g: {"size":0,"filepath":"/tmp/969b6e3d70066791c97d18000.py","newFilename":"bsmscript.py","mimetype":"text/x-python","mtime":null,"originalFilename":"bsmscript.py"}
   */

  onUpdate(status, fileInfo) {
    //Update file info DB record identified by originalFilename
    if (fileInfo !== undefined && fileInfo.originalFilename !== undefined) {
      fileInfo = { ...fileInfo, status: status };
      file_info_controller.upsertFileInfo(fileInfo).catch((err) => {
        console.log(err);
      });
    }
    this.status = status;
    console.log("Status updated to: " + status);
    console.log(status + "\tfileInfo: " + JSON.stringify(fileInfo));
  }
}

/***
 * Emit status update events
 */
const updateFileUploadStatusEmitter = (listener) => {
  const emitter = new EventEmitter();
  emitter
    .on(UPLOADSTATUS.IN_PROGRESS, (fileInfo) => {
      listener.onUpdate(UPLOADSTATUS.IN_PROGRESS, fileInfo);
    })
    .on(UPLOADSTATUS.ERROR, (fileInfo) => {
      listener.onUpdate(UPLOADSTATUS.ERROR, fileInfo);
    })
    .on(UPLOADSTATUS.COMPLETED, (fileInfo) => {
      listener.onUpdate(UPLOADSTATUS.COMPLETED, fileInfo);
    });
  return emitter;
};

module.exports = {
  UPLOADSTATUS,
  FileUploadStatusListener,
  updateFileUploadStatusEmitter,
};
