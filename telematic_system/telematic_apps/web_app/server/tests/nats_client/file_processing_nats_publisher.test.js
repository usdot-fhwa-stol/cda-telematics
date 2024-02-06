const { CreateNatsConn } = require("../../nats_client/nats_connection");
const {
  pubFileProcessingReq,
} = require("../../nats_client/file_processing_nats_publisher");
require("dotenv").config();

describe("Test NATS publisher", () => {
  it("Test NATS publish to topic ui.file.procressing", async () => {
    try {
      const nc = await CreateNatsConn();
      if (nc) {
        let processingReq = {
          filepath: "/opt/telematic/test.txt",
          upload_destination: "HOST",
        };
        pubFileProcessingReq(nc, JSON.stringify(processingReq));
        setTimeout(() => {
          nc.close();
        }, 1000);
      }
    } catch (err) {
      expect(err).not.toBeNull();
    }
  });
});
