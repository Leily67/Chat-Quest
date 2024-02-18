import express from "express";
import { StatusCodes } from "http-status-codes";
import { AccessToken, AccessTokenType } from "../models/access_token";
import { Auth } from "../utils/auth";
import { Log } from "../utils/log";

export const auth = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<express.Response | void> => {
  try {
    let accessToken = await Auth.token(req, res);

    if (!accessToken || !accessToken._id || !accessToken.expires_at) {
      Log.debug("The request is not authenticated (auth.middleware)");
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Unauthorized",
      });
    }

    if (accessToken.expires_at < new Date()) {
      Log.debug(`The token ${accessToken.token} is expired, deleting it (auth.middleware)`);
      await AccessToken.delete(accessToken._id);
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Unauthorized",
      });
    }

    AccessToken.used(accessToken._id);

    return next();
  } catch {
    Log.error("Failed to authenticate the request (auth.middleware)");
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Unauthorized",
    });
  }
};
