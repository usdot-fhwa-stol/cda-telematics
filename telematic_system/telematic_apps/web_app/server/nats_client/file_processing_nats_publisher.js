require("dotenv").config();
const fileProcessingSubject = process.env.FILE_PROCESSING_SUBJECT;

exports.pubFileProcessingReq = async (natsConn, payload) => {
  if (natsConn) {
    natsConn.publish(fileProcessingSubject, String(payload));
    console.log(
      `Send file processing request: ${JSON.stringify(payload)} to subject: ${fileProcessingSubject}`
    );
  } else {
    throw new Error(
      "Cannot send file processing request as NATS connection is undefined!"
    );
  }
};
