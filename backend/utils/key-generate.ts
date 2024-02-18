import fs from "fs";
import generateApiKey from "generate-api-key";

fs.writeFileSync(
  ".env",
  fs
    .readFileSync(".env", "utf8")
    .replace(
      /JWT_SECRET=.*/,
      `JWT_SECRET=${generateApiKey({ method: "string", length: 82 })}`
    )
    .replace(
      /API_KEY=.*/,
      `API_KEY=${generateApiKey({ method: "string", length: 82 })}`
    )
);
