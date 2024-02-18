import express from "express";
import { signUp, signIn, signOut, tmp } from "../controllers/auth.controller";
import { auth } from "../middlewares/auth.middleware";

export const authRoutes = express.Router();

authRoutes.post("/auth/sign-in", signIn);
authRoutes.post("/auth/sign-up", signUp);
authRoutes.post("/auth/tmp", tmp);
authRoutes.post("/auth/sign-out", auth, signOut);
