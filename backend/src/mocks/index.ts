import { rooms } from "./rooms";
import { roomsUsers } from "./rooms_users";
import { messages } from "./messages";
import { users } from "./users";
import { reactions } from "./reactions";

export const populate = async (): Promise<void> => {
  await users();
  await rooms();
  await roomsUsers();
  await messages();
  await reactions();
};
