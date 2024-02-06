const { listObjects } = require("../../file_upload/s3_list_objects");
describe("FileUpload Status Emitter", () => {
  it("UPDATE()", async () => {
    (async () => {
      await listObjects()
        .then((data) => {
          expect(data).not.toBeNull();
        })
        .catch((err) => {
          console.log(err);
          expect(err.error).not.toBeNull();
        });
    })();
  });
});
