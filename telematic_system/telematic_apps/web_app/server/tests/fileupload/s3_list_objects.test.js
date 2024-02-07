const { listObjects } = require("../../file_upload/s3_list_objects");
describe("List S3 objects", () => {
  it("listObjects()", async () => {
    (async () => {
      await listObjects()
        .then((data) => {
          expect(data).not.toBeNull();
        })
        .catch((err) => {
          expect(err.error).not.toBeNull();
        });
    })();
  });
});
