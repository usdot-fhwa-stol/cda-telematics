const http = require("http");
require("dotenv").config();
const { uploadFile } = require("./file_upload/file_uploader");
const port = process.env.UPLOAD_HTTP_PORT;
const uploadTimeout = parseInt(process.env.UPLOAD_TIME_OUT, 3600000);

const requestListener = async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  await uploadFile(req)
    .then((data) => {
      res.writeHead(200);
      res.write(JSON.stringify(data));
      res.end();
    })
    .catch((err) => {
      res.writeHead(401);
      res.end(JSON.stringify(err));
    });
};

const httpServer = http
  .createServer(requestListener)
  .on("connection", function (socket) {
    socket.on("timeout", function () {
      console.log("socket timeout");
    });
  })
  .listen(port, () => {
    console.log(`Server is running on http://${port}`);
  });
httpServer.headersTimeout = uploadTimeout;
httpServer.keepAliveTimeout = uploadTimeout;
httpServer.timeout = uploadTimeout;
httpServer.maxHeadersCount = 2000;
httpServer.maxConnections = 2000;
httpServer.maxBodyLength = 2000;
httpServer.requestTimeout = uploadTimeout;
