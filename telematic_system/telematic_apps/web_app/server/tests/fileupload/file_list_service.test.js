const {
  filterFiles,
  listAllDBFiles,
  listAllFiles,
  listAllDBFilesAndS3Objects,
} = require("../../file_upload/file_list_service");
const listS3 = require("../../file_upload/s3_list_objects");
const fileInfoController = require("../../controllers/file_info.controller");
let objectsCaseOne = [
  {
    original_filename: "filename",
    size: 23575448,
    filepath: "s3-bucket-name",
  },
  {
    filepath: "s3-bucket-name",
    original_filename: "telematic.csv",
    size: 1740113,
  },
];

let objectsCaseTwo = [
  {
    original_filename: "same-file-name",
    size: 23575448,
    filepath: "s3-bucket-name",
  },
];

let objectsCaseThree = [];

let objectsCaseFour = [
  {
    original_filename: "same-file-name",
    size: 23575448,
    filepath: "s3-bucket-name",
  },
  {
    original_filename: "telematic.csv",
    size: 1740113,
    filepath: "s3-bucket-name",
  },
  {
    original_filename: "filename",
    size: 23575448,
    filepath: "s3-bucket-name",
  },
];

let fileInfos = [
  {
    id: 1,
    content_location: "/opt/telematics/upload/filename",
    original_filename: "same-file-name",
    process_status: null,
    process_error_msg: null,
    size: 23575448,
    upload_status: "COMPLETED",
    upload_error_msg: null,
    description: "Random descriptions",
    created_at: "2024-02-06T03:32:11.000Z",
    created_by: 1,
    updated_at: "2024-02-06T03:32:11.000Z",
    updated_by: 1,
  },
];

describe("List file service", () => {
  it("Filter DB files throw error", async () => {
    await filterFiles({}).catch((err) => {
      expect(err.error).not.toBeNull();
    });
  });

  it("List all S3 files throw error", async () => {
    await listAllDBFilesAndS3Objects().catch((err) => {
      expect(err.error).not.toBeNull();
    });
  });

  it("List all files throw error", async () => {
    await listAllFiles().catch((err) => {
      expect(err.error).not.toBeNull();
    });
  });

  it("List all DB files throw error", async () => {
    await listAllDBFiles().catch((err) => {
      expect(err.error).not.toBeNull();
    });
  });

  it("Filter DB files successful", async () => {
    jest.spyOn(fileInfoController, "list").mockResolvedValueOnce(fileInfos);
    await filterFiles({}).then((data) => {
      expect(data).not.toBeNull();
    });
  });
  it("List all files successful case one", async () => {
    jest.spyOn(fileInfoController, "list").mockResolvedValueOnce(fileInfos);
    jest.spyOn(fileInfoController, "upsertFileInfo").mockResolvedValueOnce([]);
    jest.spyOn(listS3, "listObjects").mockResolvedValueOnce(objectsCaseOne);
    await listAllFiles().then((data) => {
      expect(data).not.toBeNull();
    });
  });

  it("List all S3 files successful case two", async () => {
    jest.spyOn(fileInfoController, "list").mockResolvedValueOnce(fileInfos);
    jest.spyOn(fileInfoController, "upsertFileInfo").mockResolvedValueOnce([]);
    jest.spyOn(listS3, "listObjects").mockResolvedValueOnce(objectsCaseTwo);
    await listAllDBFilesAndS3Objects().then((data) => {
      expect(data).not.toBeNull();
    });
  });

  it("List all S3 files successful case three", async () => {
    jest.spyOn(fileInfoController, "list").mockResolvedValueOnce(fileInfos);
    jest.spyOn(fileInfoController, "upsertFileInfo").mockResolvedValueOnce([]);
    jest.spyOn(listS3, "listObjects").mockResolvedValueOnce(objectsCaseThree);
    await listAllDBFilesAndS3Objects().then((data) => {
      expect(data).not.toBeNull();
    });
  });

  it("List all S3 files successful case four", async () => {
    jest.spyOn(fileInfoController, "list").mockResolvedValueOnce(fileInfos);
    jest.spyOn(fileInfoController, "upsertFileInfo").mockResolvedValueOnce([]);
    jest.spyOn(listS3, "listObjects").mockResolvedValueOnce(objectsCaseFour);
    await listAllDBFilesAndS3Objects().then((data) => {
      expect(data).not.toBeNull();
    });
  });

  it("List all DB files successful", async () => {
    jest.spyOn(fileInfoController, "list").mockResolvedValueOnce(fileInfos);
    await listAllDBFiles().then((data) => {
      expect(data).not.toBeNull();
    });
  });
});
