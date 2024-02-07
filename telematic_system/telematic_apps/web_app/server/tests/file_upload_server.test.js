const request = require("supertest");
const { httpServer } = require("../file_upload_server");
const fs = require("fs");
const path = require("path");
const NATS = require("nats");
const NATSConnModule = require("../nats_client/nats_connection");
const NATSMock = require("@sensorfactdev/mock-node-nats");
const { error } = require("console");

describe("POST file upload service", () => {
  it("/api/upload/list/all ", async () => {
    const res = await request(httpServer).post("/api/upload/list/all");
    expect(res.statusCode).toBe(500);
  });

  it("/api/upload ", async () => {
    const resErr = await request(httpServer)
      .post("/api/upload")
    expect(resErr.statusCode).toBe(500);
  })


  it("/api/upload ", async () => {
    jest
    .spyOn(NATSConnModule, "CreateNatsConn")
    .mockResolvedValueOnce(NATSMock.connect());
    let filename = "mock.txt";
    let formData = {
      fields: { filename: filename, description: "test desc" },
      files: fs.createReadStream(
        path.join(__dirname, "file_upload_server.test.js")
      ),
    };
    const res = await request(httpServer)
      .post("/api/upload")
      .field("fields", JSON.stringify(formData.fields))
      .attach("files", formData.files)
      console.log(res.error)
    expect(res.statusCode).toBe(200);
  });

  it("/api health_check ", async () => {
    const res = await request(httpServer).post("/api");
    expect(res.statusCode).toBe(200);
  });
});

describe("GET file upload service", () => {
  it("/api health_check ", async () => {
    const res = await request(httpServer).get("/api");
    expect(res.statusCode).toBe(200);
  });
});
