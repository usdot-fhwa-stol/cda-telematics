require("dotenv").config();
const file_processing_subject = process.env.FILE_PROCESSING_SUBJECT;

exports.pub_file_processing_req = async (nc, payload) => {
  if (nc) {
    nc.publish(file_processing_subject, String(payload));
    console.log(
      `Send file processing request: ${payload} to subject: ${file_processing_subject}`
    );
  } else {
    throw new Error(
      "Cannot send file processing request as NATS connection is undefined!"
    );
  }
};
