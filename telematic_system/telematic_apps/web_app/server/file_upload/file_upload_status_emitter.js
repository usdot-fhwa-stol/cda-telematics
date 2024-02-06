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
   * e.g: {"size":0,"filepath":"/tmp/969b6e3d70066791c97d18000.py","newFilename":"bsm.bag","mimetype":"text/x-python","mtime":null,"originalFilename":"bsm.bag"}
   */

  onUpdate(status, fileInfo) {
    //Update file info DB record identified by originalFilename
    if (fileInfo !== undefined && fileInfo.originalFilename !== undefined) {
      fileInfo = { ...fileInfo, status: status };
      file_info_controller.upsertFileInfo(fileInfo).catch((err) => {
        console.log(err);
        console.trace();
      });
    }
    this.status = status;
    console.log("Status updated to: " + status + "\tFileInfo: " + JSON.stringify(fileInfo));
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
