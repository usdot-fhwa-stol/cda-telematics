const {
  UPLOADSTATUS,
  FileUploadStatusListener,
  updateFileUploadStatusEmitter,
} = require("../../../lib/file_upload/file_upload_status_emitter");

exports.fileUploader = (req, res) => {
  const listener = new FileUploadStatusListener(UPLOADSTATUS.UNKNOWN);
  // upload file and update below status
  if (listener.status === UPLOADSTATUS.UNKNOWN)
    updateFileUploadStatusEmitter(listener).emit(UPLOADSTATUS.IN_PROGRESS, req);

  if (listener.status === UPLOADSTATUS.IN_PROGRESS)
    updateFileUploadStatusEmitter(listener).emit(UPLOADSTATUS.ERROR, req);

  if (listener.status === UPLOADSTATUS.ERROR)
    updateFileUploadStatusEmitter(listener).emit(UPLOADSTATUS.COMPLETED, req);
};
