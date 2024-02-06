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
 */
const http = require("http");
const formidable = require("formidable");
require("dotenv").config();
const { uploadFile } = require("./file_upload/file_upload_service");
const {
  listAllFiles,
  filterFiles,
} = require("./file_upload/file_list_service");
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
};

const requestListener = function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  if (req.method === HTTP_METHODS.POST) {
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
