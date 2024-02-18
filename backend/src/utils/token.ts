import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { AccessToken } from "../models/access_token";

config();

const { JWT_SECRET } = process.env;
const DAY_IN_SECONDS = 86400;
const JWT_VALIDITY_IN_DAYS = 7;

export class Token {
  static async generate(id: string): Promise<string> {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    let token = jwt.sign({ id }, JWT_SECRET, {
      expiresIn: DAY_IN_SECONDS * JWT_VALIDITY_IN_DAYS,
    });

    while (await AccessToken.find(token)) {
      token = jwt.sign({ id }, JWT_SECRET ?? "", {
        expiresIn: DAY_IN_SECONDS * JWT_VALIDITY_IN_DAYS,
      });
    }

    return token;
  }
}
