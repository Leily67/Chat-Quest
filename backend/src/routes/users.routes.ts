import express from "express";
import { index, messages, show } from "../controllers/users.controller";
import { auth } from "../middlewares/auth.middleware";

export const usersRoutes = express.Router();

usersRoutes.get("/users", auth, index);
usersRoutes.get("/users/:id", auth, show);
usersRoutes.get("/users/:id/messages", auth, messages);
