require("dotenv").config();
const fileProcessingSubject = process.env.FILE_PROCESSING_SUBJECT;

exports.pubFileProcessingReq = async (nc, payload) => {
  if (nc) {
    nc.publish(fileProcessingSubject, String(payload));
    console.log(
      `Send file processing request: ${payload} to subject: ${fileProcessingSubject}`
    );
  } else {
    throw new Error(
      "Cannot send file processing request as NATS connection is undefined!"
    );
  }
};
