const Transform = require("stream").Transform;
const formidable = require("formidable");
const { uploadToS3 } = require("./s3_uploader");
const {
  UPLOADSTATUS,
  updateFileUploadStatusEmitter,
  FileUploadStatusListener,
} = require("./file_upload_status_emitter");
const uploadDest = process.env.UPLOAD_DESTINATION;
const uploadDestPath = process.env.UPLOAD_DESTINATION_PATH;

exports.uploadFile = async (req) => {
  return new Promise((resolve, reject) => {
    let options = {
      maxFileSize: 20 * 1024 * 1024 * 1024, //20 GBs converted to bytes,
      maxTotalFileSize: 20 * 1024 * 1024 * 1024, //20 GBs converted to bytes,
      allowEmptyFiles: false,
      keepExtensions: true,
      multiples: true,
    };
    const form = formidable(options);
    const listener = new FileUploadStatusListener(UPLOADSTATUS.UNKNOWN);
    form.parse(req, (err, fields, files) => {});

    form
      .on("end", () => {
        if (uploadDest.toLowerCase() !== "s3") {
          resolve({
            message: " File uploaded end.",
          });
        }
      })
      .on("error", (fileInfoWithError) => {
        if (uploadDest.toLowerCase() === "s3") {
          updateFileUploadStatusEmitter(listener).emit(
            UPLOADSTATUS.ERROR,
            fileInfoWithError
          );
        }
        console.log(fileInfoWithError);
        reject(fileInfoWithError);
      })
      .on("abort", (err) => {
        console.log("aborted");
        reject(err);
      })
      .on("data", (data) => {
        if (data.status === "completed") {
          updateFileUploadStatusEmitter(listener).emit(
            UPLOADSTATUS.COMPLETED,
            data.fileInfo
          );
          resolve({
            message: " File uploaded to S3!!",
            data: data,
          });
        }
      })
      .on("fileBegin", (formName, file) => {
        file.newFilename = file.originalFilename;

        //Write stream into S3 bucket
        if (uploadDest.toLowerCase() === "s3") {
          file.filepath = process.env.S3_BUCKET;

          //Update upload status
          if (listener.status === UPLOADSTATUS.UNKNOWN)
            updateFileUploadStatusEmitter(listener).emit(
              UPLOADSTATUS.IN_PROGRESS,
              file.toJSON()
            );

          file.open = async function () {
            this._writeStream = new Transform({
              transform(chunk, encoding, callback) {
                callback(null, chunk);
              },
            });
            this._writeStream.on("error", (err) => {
              let fileInfoWithError = {
                ...file.toJSON(),
                error: err,
              };
              form.emit("error", fileInfoWithError);
            });

            uploadToS3(this._writeStream, this.originalFilename)
              .then((data) => {
                form.emit("data", {
                  status: "completed",
                  fileInfo: file.toJSON(),
                });
              })
              .catch((err) => {
                let fileInfoWithError = {
                  ...file.toJSON(),
                  error: err,
                };
                form.emit("error", fileInfoWithError);
              });
          };
        } else {
          //Write file to HOST machine
          file.filepath = uploadDestPath + "/" + file.originalFilename;
        }
      });
  });
};
