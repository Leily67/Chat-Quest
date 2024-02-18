import { StatusCodes } from "http-status-codes";
import { AccessToken } from "../models/access_token";
import { User } from "../models/user";
import { Auth } from "../utils/auth";
import { Log } from "../utils/log";
import { Token } from "../utils/token";
import express from "express";
import { type UserType } from "../models/user";
import { RoomType } from "../models/room";

export const me = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<UserType>> => {
  try {
    let user = await Auth.user(req, res);
    if (!user || !user._id) throw new Error("Unauthorized");
    Log.info(`User #${user._id} call /me endpoint`);

    let token = await Token.generate(user._id?.toString());

    let accessToken = await User.token(user._id);

    if (accessToken) {
      accessToken.token = token;
      accessToken.last_used_at = new Date();
      await AccessToken.update(accessToken);
    } else {
      throw new Error("Unauthorized");
    }

    Log.info(`User #${user._id} token updated`);
    return res.json({
      token,
      user,
    });
  } catch {
    Log.error("Failed to get user using /me endpoint");
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized" });
  }
};

export const rooms = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<RoomType[]>> => {
  try {
    let user = await Auth.user(req, res);
    if (!user || !user._id) throw new Error("Unauthorized");
    Log.info(`User #${user._id} call /authenticated-user/rooms endpoint`);
		return res.json(await User.accessibleRooms(user._id));
  } catch (e) {
    Log.error("Failed to get user using /authenticated-user/rooms endpoint " + e);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized" });
  }
};
