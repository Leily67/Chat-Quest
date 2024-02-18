import express from "express";
import { StatusCodes } from "http-status-codes";
import { Log } from "../utils/log";

export const sanctum = async (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
): Promise<express.Response | void> => {
	try {
		let apiKey = req.headers["x-api-key"] as string;
		if (!apiKey) {
			Log.debug("This endpoint requires an API key, but none was provided (sanctum.middleware)");
			return res.status(StatusCodes.UNAUTHORIZED).json({
				message: "Unauthorized",
			});
		}

		if (process.env.API_KEY !== apiKey) {
			Log.debug("The API key provided is invalid, access denied (sanctum.middleware)");
			return res.status(StatusCodes.UNAUTHORIZED).json({
				message: "Unauthorized",
			});
		}

		return next();
	} catch {
		Log.error(
			"Failed to authenticate the request because the API key is invalid or missing (sanctum.middleware)"
		);
		return res.status(StatusCodes.UNAUTHORIZED).json({
			message: "Unauthorized",
		});
	}
};
