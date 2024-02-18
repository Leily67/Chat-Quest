import { User, UserType } from "../models/user";
import express from "express";
import { Hash } from "../utils/hash";
import { Token } from "../utils/token";
import { AccessToken } from "../models/access_token";
import { Log } from "../utils/log";
import { Auth } from "../utils/auth";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

export const signUp = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response> => {
  try {
    const { nickname, email, password } = req.body;

    Log.info(`Attempt to sign up with payload: ${JSON.stringify(req.body)}`);

    let user = await User.findOne({ email });

    if (user) {
      Log.debug(`Email ${email} already used, failed to sign up`);
      return res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .json({ message: "Email already used" });
    }

    if (!password?.match(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/)) {
      Log.debug(`Password ${password} is invalid, failed to sign up`);
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        message:
          "Password must contain at least 6 characters, including UPPER/lowercase and numbers",
      });
    }

    try {
      user = await User.create({
        nickname,
        email,
        password: Hash.make(password),
      });
    } catch {
      Log.debug("Some fields are invalid, failed to sign up");
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid credentials",
      });
    }

    if (!user || !user._id) {
      Log.error(
        "The user was not created, failed to sign up with payload" +
        JSON.stringify(req.body)
      );
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }

    let token = await Token.generate(user._id?.toString());

    AccessToken.create({
      token,
      user: user._id,
    });

    Log.info(`User #${user._id} signed up`);
    return res.status(StatusCodes.CREATED).json({ token, user });
  } catch (e) {
    Log.error(
      "The user was not created, failed to sign up with payload" +
      JSON.stringify(req.body)
    );
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
};

export const signIn = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response> => {
  try {
    const { email, password: _ } = req.body;

    Log.info(`Attempt to sign in with payload: ${JSON.stringify(req.body)}`);

    let user = await User.findByEmailWithPassword(email);

    if (
      !user ||
      !user._id ||
      !user.password ||
      !Hash.compare(_, user.password || null)
    ) {
      Log.debug(`Invalid credentials, failed to sign in`);
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid credentials",
      });
    }

    const { password, ...userWithoutPassword } = user;

    let token = await Token.generate(user._id?.toString());

    AccessToken.create({
      token,
      user: user._id,
    });

    Log.info(`User #${user._id} signed in`);
    return res.status(StatusCodes.OK).json({
      token,
      user: userWithoutPassword,
    });
  } catch (e) {
    Log.error(`Failed to sign in: ${e}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
};

export const signOut = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  try {
    if (await Auth.user(req, res)) {
      let accessToken = await Auth.token(req, res);
      await AccessToken.delete(new mongoose.Types.ObjectId(accessToken._id));
      Log.info(`User #${accessToken.user} signed out`);
      return res.status(StatusCodes.NO_CONTENT).json(null);
    }
  } catch {
    Log.debug("Failed to sign out, the user is not authenticated");
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized" });
  }
};

export const tmp = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response> => {
  try {
    const { nickname } = req.body;

    Log.info(`Attempt to create temporary user with nickname ${nickname}`);

    let tempUser = await User.create({
      nickname: nickname,
      is_temporary: true,
    });

    let user = await User.findOne({ _id: tempUser._id });

    if (!user || !user._id) {
      Log.error(`The temporary user was not created with nickname ${nickname}`);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }

    let token = await Token.generate(user._id?.toString());

    AccessToken.create({
      token,
      user: user._id,
    });

    Log.info(`Temporary user #${user._id} signed in`);
    return res.status(StatusCodes.CREATED).json({ token, user });
  } catch {
    Log.error(
      `The temporary user was not created with nickname ${req.body.nickname}`
    );
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
};