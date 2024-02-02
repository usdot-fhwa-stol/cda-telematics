const file_info_controller = require("../controllers/file_info.controller");

const UPLOADSTATUS = {
  UNKNOWN: "UNKNOWN",
  IN_PROGRESS: "IN_PROGRESS",
  ERROR: "ERROR",
  COMPLETED: "COMPLETED",
};

const EventEmitter = require("node:events");

class FileUploadStatusListener {
  constructor(status) {
    this.status = status;
  }

  onUpdate(status, fileInfo) {
    //Update file info DB record
    file_info_controller.upsertFileInfo(fileInfo).catch((err) => {
      console.log(err);
    });
    this.status = status;
    console.log("Status updated to: " + status);
    console.log(status + "\tfileInfo: " + JSON.stringify(fileInfo));
  }
}

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
