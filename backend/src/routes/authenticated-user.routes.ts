import express from "express";
import { auth } from "../middlewares/auth.middleware";
import { me, rooms } from "../controllers/authenticated-user.controller";

export const authenticatedUserRoutes = express.Router();

authenticatedUserRoutes.get("/authenticated-user/me", auth, me);
authenticatedUserRoutes.get("/authenticated-user/rooms", auth, rooms);
