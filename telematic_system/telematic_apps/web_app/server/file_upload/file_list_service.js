const { list, upsertFileInfo } = require("../controllers/file_info.controller");
const { listObjects } = require("../file_upload/s3_list_objects");
const { UPLOADSTATUS } = require("./file_upload_status_emitter");
const uploadDest = process.env.UPLOAD_DESTINATION;

exports.filterFiles = async (req_fields, res) => {
  let contents = [];
  let data = await list(req_fields, res);
  if (!data || data.errorMsg) {
    throw new Error(
      "Error get a list file info from MYSQL DB: " +
        (data.errorMsg ? data.errorMsg : "Unknown")
    );
  } else {
    contents.push(...data);
  }
  return contents;
};

exports.listAllFiles = async (req, res) => {
  if (uploadDest.trim().toLowerCase() === "s3") {
    return await listAllDBFilesAndS3Objects(req, res);
  } else {
    return await listAllDBFiles(req, res);
  }
};

const listAllDBFiles = async (req, res) => {
  let data = await list({}, res);
  if (!data || data.errorMsg) {
    return {
      errorMsg: data
        ? data.errorMsg
        : "Error get a list file info from MYSQL DB",
    };
  }
  return data;
};

const listAllDBFilesAndS3Objects = async (req, res) => {
  let contents = [];
  let existingFileNames = [];
  let data = await list({}, res);
  if (!data || data.errorMsg) {
    return {
      errorMsg: data
        ? data.errorMsg
        : "Error get a list file info from MYSQL DB",
    };
  } else {
    contents.push(...data);
    data.forEach((d) => {
      existingFileNames.push(d.original_filename);
    });
  }

  let objects = await listObjects();
  console.log("Your bucket contains the following objects:");
  console.log(objects);
  if (!objects || objects.errorMsg) {
    return {
      errorMsg: objects
        ? objects.errorMsg
        : "Error get a list file info from MYSQL DB",
    };
  }

  //Update database with the list of S3 Objects
  if (Array.isArray(objects)) {
    for (const object of objects) {
      if (!existingFileNames.includes(object.originalFilename)) {
        let newFileFromS3 = { ...object, status: UPLOADSTATUS.COMPLETED };
        console.log(
          "Below S3 object not found in MYSQL DB. Insert object into DB:"
        );
        console.log(newFileFromS3);
        let newFile = await upsertFileInfo(newFileFromS3);
        contents.push(newFile);
      }
    }
  }
  return contents;
};
