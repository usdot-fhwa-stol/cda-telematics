const formidable = require("formidable");
const { uploadToS3 } = require("./s3_uploader");
const uploadDest = process.env.UPLOAD_DESTINATION;
const uploadDestPath = process.env.UPLOAD_DESTINATION_PATH;
const options = {
  maxFileSize: 20 * 1024 * 1024 * 1024, //20 GBs converted to bytes,
  maxTotalFileSize: 20 * 1024 * 1024 * 1024, //20 GBs converted to bytes,
  allowEmptyFiles: false,
  keepExtensions: true,
  multiples: true,
};

exports.uploadFile = async (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable(options);
    form.parse(req, (err, fields, files) => {});

    form
      .on("end", () => {
        if (uploadDest.trim().toLowerCase() !== "s3") {
          resolve({
            message: "File upload end.",
          });
        }
      })
      .on("error", (err) => {
        reject(err);
      })
      .on("abort", (err) => {
        reject(err);
      })
      .on("fileBegin", (formName, file) => {
        //Write stream into S3 bucket
        if (uploadDest.trim().toLowerCase() === "s3") {
          uploadToS3(file)
            .then((data) => {
              resolve({
                message: " File uploaded to S3!!",
                data: data,
              });
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          //Write file to HOST machine
          file.filepath = uploadDestPath + "/" + file.originalFilename;
        }
      });
  });
};
