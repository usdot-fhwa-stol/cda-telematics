const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client } = require("@aws-sdk/client-s3");
require("dotenv").config();

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const region = process.env.S3_REGION;
const Bucket = process.env.S3_BUCKET;
const PART_SIZE = 1024 * 1024 * 10; // optional size of each part, in bytes, at least 10MB
const CONCURRENT_QUEUE_SIZE = 5; // optional size of the concurrent queue, defaults to 5

/**
 * Upload file to S3 bucket
 * @param {*} writeStream File stream part
 * @param {*} fileInfo metadata about the uploaded file
 * @returns Future promises
 */
exports.uploadToS3 = (writeStream, fileInfo) => {
  return new Promise((resolve, reject) => {
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
        Key: `${fileInfo.originalFilename}`,
        Body: writeStream,
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
        resolve("completed");
      })
      .catch((err) => {
        reject(err);
      });
  });
};
