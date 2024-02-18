import express from "express";
import { Room, RoomType } from "../models/room";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";

export const index = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<RoomType[]>> => {
  return res.json(await Room.all());
};

export const show = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<RoomType | null>> => {
  try {
    const id = req.params.id;
    return res.json(await Room.model.findById(id).populate("user").exec());
  } catch {
    return res.status(StatusCodes.NO_CONTENT).json(null);
  }
};

export const users = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<RoomType | null>> => {
  try {
    const id = req.params.id;
    const room = await Room.find(new mongoose.Types.ObjectId(id));
    if (!room) return res.status(StatusCodes.NO_CONTENT).json(null);
    return res.json(await Room.users(room));
  } catch {
    return res.status(StatusCodes.NO_CONTENT).json(null);
  }
};
