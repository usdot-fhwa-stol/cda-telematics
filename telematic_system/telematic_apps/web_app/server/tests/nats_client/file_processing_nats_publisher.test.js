const { CreateNatsConn } = require("../../nats_client/nats_connection");
const {
  pub_file_processing_req,
} = require("../../nats_client/file_processing_nats_publisher");
require("dotenv").config();

describe("Test NATS publisher", () => {
  it("Test NATS publish to topic ui.file.procressing", async () => {
    const nc = await CreateNatsConn();
    if (nc) {
      let processing_request = {
        filepath: "/opt/telematic/test.txt",
        upload_destination: "HOST",
      }
      pub_file_processing_req(nc, JSON.stringify(processing_request));
      setTimeout(() => {
        nc.close();
      }, 1000);
    }
  });
});
