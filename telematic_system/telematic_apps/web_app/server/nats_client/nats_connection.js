const { connect } = require("nats");
require("dotenv").config();
const natsServers = process.env.NATS_SERVERS;
const opts = { servers: natsServers, maxReconnectAttempts: -1 };

exports.CreateNatsConn = async () => {
  let nc;
  try {
    nc = await connect(opts);
  } catch (err) {
    throw new Error(`Error connecting to nats: ${err.message}`);
  }
  console.info(`Connected ${nc.getServer()}`);
  return nc;
};
