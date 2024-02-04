const http = require("http");
const formidable = require("formidable");
require("dotenv").config();
const { uploadFile } = require("./file_upload/file_uploader");
const { list } = require("./controllers/file_info.controller");
const port = process.env.UPLOAD_HTTP_PORT;
const uploadTimeout = parseInt(process.env.UPLOAD_TIME_OUT, 3600000);
const HTTP_METHODS = {
  POST: "POST",
  GET: "GET",
};
const HTTP_URLS = {
  API_FILE_UPLOAD: "/api/upload",
  API_FILE_UPLOADED_LIST: "/api/upload/list",
};

const requestListener = async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  switch (req.method) {
    case HTTP_METHODS.POST:
      postListener(req, res);
      break;
    default:
      health_check(req, res);
      break;
  }
};

const health_check = async function (req, res) {
  let data = { health_status: "OK" };
  res.writeHead(200);
  res.write(JSON.stringify(data));
  res.end();
};

const postListener = async (req, res) => {
  switch (req.url.split("?")[0]) {
    case HTTP_URLS.API_FILE_UPLOADED_LIST:
      formidable().parse(req, async (err, fields, files) => {
        res.write(JSON.stringify(await list(fields, res)));
        res.end();
      });
      break;
    case HTTP_URLS.API_FILE_UPLOAD:
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
      break;
    default:
      health_check(req, res);
      break;
  }
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
