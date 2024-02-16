require("dotenv").config();
const {StringCodec} = require('nats')
const fileProcessingSubject = process.env.FILE_PROCESSING_SUBJECT;

exports.pubFileProcessingReq = async (natsConn, payload) => {
  if (natsConn) {
    let payloadStr = JSON.stringify(payload);
    natsConn.publish(fileProcessingSubject,  StringCodec().encode(String(payloadStr)));
    console.log(
      `Send file processing request: ${payloadStr} to subject: ${fileProcessingSubject}`
    );
  } else {
    throw new Error(
      "Cannot send file processing request as NATS connection is undefined!"
    );
  }
};
