import { createServer } from "node:http";
import { createApp } from "./app.js";
import { config } from "./config/env.js";
import { initSockets } from "./sockets/index.js";

const app = createApp();
const httpServer = createServer(app);
initSockets(httpServer);

httpServer.listen(config.PORT, () => {
  console.log(`${config.BRAND_NAME} API listening on port ${config.PORT}`);
});
