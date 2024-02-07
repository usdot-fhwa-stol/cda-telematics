const {
  UPLOADSTATUS,
  FileUploadStatusListener,
  updateFileUploadStatusEmitter,
} = require("../../file_upload/file_upload_status_emitter");

describe("FileUpload Status Emitter", () => {
  it("update file upload status", async () => {
    const listener = new FileUploadStatusListener(UPLOADSTATUS.UNKNOWN);
    const data = {
      id: 0,
      message: "Hello world",
    };
    if (listener.status === UPLOADSTATUS.UNKNOWN)
      await updateFileUploadStatusEmitter(listener).emit(
        UPLOADSTATUS.IN_PROGRESS,
        data
      );
    expect(listener.status).toBe(UPLOADSTATUS.IN_PROGRESS);

    if (listener.status === UPLOADSTATUS.IN_PROGRESS)
      await updateFileUploadStatusEmitter(listener).emit(
        UPLOADSTATUS.ERROR,
        data
      );

    expect(listener.status).toBe(UPLOADSTATUS.ERROR);

    if (listener.status === UPLOADSTATUS.ERROR)
      await updateFileUploadStatusEmitter(listener).emit(
        UPLOADSTATUS.COMPLETED,
        data
      );

    expect(listener.status).toBe(UPLOADSTATUS.COMPLETED);
  });
});
