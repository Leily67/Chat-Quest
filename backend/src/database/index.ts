import mongoose from "mongoose";
import { populate } from "../mocks";
import { Log } from "../utils/log";

const has = (arg: string) =>
  process.argv.some((_) => [`--${arg}`, `-${arg[0]}`].includes(_));

export class Database {
  static async connect() {
    const { MONGODB_USER, MONGODB_PASSWORD, DB_NAME } = process.env;

    try {
      await mongoose.connect(
        `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@cluster0.s4qci5h.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`
      );

      console.log(`  > Connected to MongoDB (${DB_NAME})`);

      if (has("drop")) {
        await mongoose.connection.dropDatabase();
        console.log(`  > Database cleared`);
      }

      if (has("mocks")) {
        await populate();
        console.log(`  > Mocks populated`);
      }
    } catch (error) {
      Log.error(`Failed to connect to MongoDB: ${error}`);
      process.exit(1);
    }
  }
}
