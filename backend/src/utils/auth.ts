import express from "express";
import { AccessToken, AccessTokenType } from "../models/access_token";
import { User, UserType } from "../models/user";
import { StatusCodes } from "http-status-codes";

export class Auth {
  static async token(
    req: express.Request,
    res: express.Response
  ): Promise<AccessTokenType> {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw res;
    }

    let accessToken = await AccessToken.find(token);

    if (!accessToken || !accessToken._id || !accessToken.expires_at) {
      throw res;
    }

    return accessToken;
  }

  static async user(
    req: express.Request,
    res: express.Response
  ): Promise<UserType> {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw res;
    }

    let accessToken = await AccessToken.find(token);

    if (!accessToken) {
      throw res;
    }

    let user = await User.find(accessToken.user);

    if (!user) {
      throw res;
    }

    return user;
  }
}
