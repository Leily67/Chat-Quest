import express from "express";
import { index } from "../controllers/messages.controller";
import { auth } from "../middlewares/auth.middleware";
import { show } from "../controllers/rooms.controller";

export const messagesRoutes = express.Router();

messagesRoutes.get("/messages", auth, index);
messagesRoutes.get("/messages/:id", auth, show);
