import express from "express";
import { index, show, users } from "../controllers/rooms.controller";
import { auth } from "../middlewares/auth.middleware";

export const roomsRoutes = express.Router();

roomsRoutes.get("/rooms", auth, index);
roomsRoutes.get("/rooms/:id", auth, show);
roomsRoutes.get("/rooms/:id/users", auth, users);
