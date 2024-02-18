import express from "express";
import { User, UserType } from "../models/user";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";

export const index = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<UserType[]>> => {
  try {
    return res.json(await User.all());
  } catch {
    return res.status(StatusCodes.NO_CONTENT).json([]);
  }
};

export const show = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<UserType | null>> => {
  try {
    const id = req.params.id;
    return res.json(await User.find(new mongoose.Types.ObjectId(id)));
  } catch {
    return res.status(StatusCodes.NO_CONTENT).json(null);
  }
};

export const messages = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<UserType | null>> => {
  try {
    const id = req.params.id;
    return res.json(await User.messages(new mongoose.Types.ObjectId(id)));
  } catch {
    return res.status(StatusCodes.NO_CONTENT).json([]);
  }
};