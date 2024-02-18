import fs from "fs";
import moment from "moment";

enum Logs {
  APP = "APP",
  ERROR = "ERR",
  DEBUG = "DBG",
}

type File = "app.log" | "error.log" | "debug.log";

export class Log {
  private static write(type: Logs, message: string): void {
    let file: File;

    switch (type) {
      case Logs.APP:
        file = "app.log";
        break;
      case Logs.ERROR:
        file = "error.log";
        break;
      case Logs.DEBUG:
        file = "debug.log";
        break;
    }

    fs.appendFileSync(
      `logs/${file}`,
      `[${moment().format("DD/MM/YYYY HH:mm:ss")}] - ${message}\n`
    );
  }

  private static _(log: Logs, message: string): void {
    console.log(
      `  [${log.toUpperCase()}] - ${moment().format(
        "DD/MM/YYYY HH:mm:ss"
      )} - ${message}`
    );
    this.write(log, message);
  }

  static info(message: string): void {
    this._(Logs.APP, message);
  }

  static app(message: string): void {
    this._(Logs.APP, message);
  }

  static error(message: string): void {
    this._(Logs.ERROR, message);
  }

  static debug(message: string): void {
    this._(Logs.DEBUG, message);
  }
}
