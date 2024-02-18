import express, { Express } from "express";
import cors from "cors";
import { routes } from "./routes";
import { setup, serve } from "swagger-ui-express";
import { sanctum } from "./middlewares/sanctum.middleware";

export const app: Express = express();

app.use(cors());
app.use(express.json());

app.use(
  "/api/docs",
  serve,
  setup(require("../swagger.json"), {
    customCss: ".swagger-ui .topbar { display: none }",
  })
);

app.use("/api/", sanctum, routes);
