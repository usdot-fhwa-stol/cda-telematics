const { createNatsConn } = require("../../nats_client/nats_connection");
const {
  pubFileProcessingReq,
} = require("../../nats_client/file_processing_nats_publisher");
require("dotenv").config();

describe("Test NATS publisher", () => {
  it("Test NATS publish to topic ui.file.procressing", async () => {
    try {
      const natsConn = undefined;
      let processingReq = {
        filepath: "/opt/telematic/test.txt"
      };
      await pubFileProcessingReq(natsConn, JSON.stringify(processingReq));
    } catch (err) {
      expect(err).not.toBeNull();
    }
  });
});
