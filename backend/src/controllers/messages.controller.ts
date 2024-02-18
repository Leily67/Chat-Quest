import express from "express";
import { Message, MessageType } from "../models/message";
import { StatusCodes } from "http-status-codes";

export const index = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<MessageType[]>> => {
  return res.json(await Message.all());
};

export const show = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<MessageType | null>> => {
  try {
    const id = req.params.id;
    return res.json(await Message.model.findById(id).populate("user").exec());
  } catch {
    return res.status(StatusCodes.NO_CONTENT).json(null);
  }
};
