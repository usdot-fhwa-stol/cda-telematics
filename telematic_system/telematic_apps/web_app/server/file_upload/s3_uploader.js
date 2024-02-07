const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client } = require("@aws-sdk/client-s3");
const Transform = require("stream").Transform;
require("dotenv").config();

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const region = process.env.S3_REGION;
const Bucket = process.env.S3_BUCKET;
const PART_SIZE = parseInt(process.env.PART_SIZE);
const CONCURRENT_QUEUE_SIZE = parseInt(process.env.CONCURRENT_QUEUE_SIZE); 

/**
 * Upload file to S3 bucket
 * @param {*} file File to write to S3 bucket
 * @returns Future promises
 */
exports.uploadToS3 = (file) => {
  return new Promise((resolve, reject) => {
    file.filepath = process.env.S3_BUCKET;
    file.open = async function () {
      this._writeStream = new Transform({
        transform(chunk, encoding, callback) {
          callback(null, chunk);
        },
      });

      //Stream write error
      this._writeStream.on("error", (err) => {
        let fileInfoWithError = {
          ...file.toJSON(),
          error: err,
        };
        reject(fileInfoWithError);
      });

      // upload to S3
      new Upload({
        client: new S3Client({
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
          region,
        }),
        params: {
          Bucket,
          Key: `${file.originalFilename}`,
          Body: this._writeStream,
        },
        tags: [], // optional tags
        queueSize: CONCURRENT_QUEUE_SIZE,
        partSize: PART_SIZE,
        leavePartsOnError: false, // optional manually handle dropped parts
      })
        .on("httpUploadProgress", (progress) => {
          console.log(progress);
        })
        .done()
        .then((data) => {
          resolve(file.toJSON());
        })
        .catch((err) => {
          let fileInfoWithError = {
            ...file.toJSON(),
            error: err,
          };
          reject(fileInfoWithError);
        });
    }; //File open end
  });
};
