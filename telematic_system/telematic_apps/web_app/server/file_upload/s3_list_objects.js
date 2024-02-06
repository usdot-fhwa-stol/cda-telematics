const { ListObjectsV2Command, S3Client } = require("@aws-sdk/client-s3");
require("dotenv").config();

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const region = process.env.S3_REGION;
const Bucket = process.env.S3_BUCKET;

exports.listObjects = async () => {
  const client = new S3Client({
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    region,
  });
  const command = new ListObjectsV2Command({
    Bucket: Bucket,
  });
  let contents = [];
  let isTruncated = true;
  while (isTruncated) {
    const { Contents, IsTruncated, NextContinuationToken } = await client.send(
      command
    );
    const contentsList = Contents.map((c) => ({
      originalFilename: c.Key,
      size: c.Size,
      filepath: Bucket,
    }));
    isTruncated = IsTruncated;
    contents.push(...contentsList);
    command.input.ContinuationToken = NextContinuationToken;
  }
  return contents;
};
