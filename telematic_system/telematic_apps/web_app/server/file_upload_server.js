/*
 * Copyright (C) 2019-2024 LEIDOS.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 * Description:
 * An http server that provides APIs to serve file upload request and file list request.
 *
 * - requestListener: A listener to inspect request URL and dispatch the request further to other listeners.
 * - health_check: A function to provide a response of the server running status.
 * - postListener: A listener to serve all post request and provide corresponding response.
 *
 * Revision:
 * Update response headers to allow passing credentials and authentication parameters.
 */
const http = require("http");
const formidable = require("formidable");
require("dotenv").config();
const { uploadFile } = require("./file_upload/file_upload_service");
const { listAllFiles } = require("./file_upload/file_list_service");
const { verifyToken } = require("./utils/verifyToken");
const { updateDescription } = require("./controllers/file_info.controller");
const { createNatsConn } = require("./nats_client/nats_connection");
const {
  pubFileProcessingReq,
} = require("./nats_client/file_processing_nats_publisher");
const { env } = require("process");
const port = process.env.UPLOAD_HTTP_PORT;
const allowedOrigin = process.env.ALLOW_CLIENT_URL;
const uploadTimeout = parseInt(process.env.UPLOAD_TIME_OUT, 3600000);
const HTTP_METHODS = {
  POST: "POST",
  GET: "GET",
};
const HTTP_URLS = {
  API_FILE_UPLOAD: "/api/upload",
  API_FILE_UPLOADED_LIST: "/api/upload/list/all",
  API_FILE_DESCRIPTION_UPDATE: "/api/upload/description",
  API_PROCESS_REQUEST: "/api/upload/process/request",
};

const uploadDestPath = process.env.UPLOAD_DESTINATION_PATH;

const requestListener = function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Request-Headers", "*");
  res.setHeader("Access-Control-Request-Method", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  if (req.method === HTTP_METHODS.POST) {
    let userInfo = verifyToken(req);
    if (!userInfo) {
      res.writeHead(401);
      res.write("User is unauthenticated or user session expired!");
      res.end();
      return;
    }
    postListener(req, res);
  } else {
    health_check(req, res);
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
        await listAllFiles(req, res)
          .then((data) => {
            res.writeHead(200);
            res.write(JSON.stringify(data));
            res.end();
          })
          .catch((err) => {
            res.writeHead(500);
            res.write(
              JSON.stringify({ error: err.message || "Unknown server error!" })
            );
            res.end();
          });
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
          res.writeHead(500);
          res.write(
            JSON.stringify({ error: err.message || "Unknown server error!" })
          );
          res.end();
        });
      break;
    case HTTP_URLS.API_FILE_DESCRIPTION_UPDATE:
      formidable().parse(req, async (err, fields, files) => {
        let fileInfo = JSON.parse(fields["fields"]);
        await updateDescription(fileInfo)
          .then((data) => {
            res.writeHead(200);
            res.write(JSON.stringify(data));
            res.end();
          })
          .catch((err) => {
            res.writeHead(500);
            res.write(
              JSON.stringify({ error: err.message || "Unknown server error!" })
            );
            res.end();
          });
      });
      break;
    case HTTP_URLS.API_PROCESS_REQUEST:
      formidable().parse(req, async (err, fields, files) => {
        try {
          let fileInfo = JSON.parse(fields["fields"]);
          //Send file process request to NATS
          let processingReq = {
            uploaded_path: uploadDestPath,
            filename: fileInfo.original_filename,
          };

          let natsConn = await createNatsConn();
          await pubFileProcessingReq(natsConn, processingReq);
          await natsConn.close();
          res.writeHead(200);
          res.write("Process request sent: " + processingReq.filename);
          res.end();
        } catch (err) {
          console.log(err);
          res.writeHead(500);
          res.write(
            JSON.stringify({ error: err.message || "Unknown server error!" })
          );
          res.end();
        }
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
    console.log(
      `Server is running on http://${port}. Allowed client url ${allowedOrigin}`
    );
  });
httpServer.headersTimeout = uploadTimeout;
httpServer.keepAliveTimeout = uploadTimeout;
httpServer.timeout = uploadTimeout;
httpServer.requestTimeout = uploadTimeout;

module.exports = { httpServer };
