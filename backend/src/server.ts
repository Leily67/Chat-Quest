import http from "http";
import { app } from "./app";
import { Socket } from "./sockets";
import { AddressInfo } from "net";
import { Database } from "./database";
import { config } from "dotenv";

config();

const main = async () => {
  const port = process.env.PORT || "3000";
  app.set("port", port);

  const server = http.createServer(app);

  server.on("error", () => {
    console.error("The server could not start.");
    process.exit(1);
  });

  server.on("listening", () => {
    const { port } = server.address() as AddressInfo;
    console.log(
      `
  Server is running at \x1b[32mhttp://localhost:${port}\x1b[0m
  Sockets are running at \x1b[32mws://localhost:${port}\x1b[0m
  Documentation is available at \x1b[32mhttp://localhost:${port}/api/docs\x1b[0m
  
  You can use the following options:

    --drop, -d: Drop the database
    --mocks, -m: Populate the database with mocks

  Press CTRL-C to stop...
    `
    );
  });

  server.listen(process.env.PORT || 3000);
  await Database.connect();
  Socket.initialize(server);

  console.log(
    "\n  Logs will be displayed here (and in the logs/ folder)...\n"
  );
};

main();
