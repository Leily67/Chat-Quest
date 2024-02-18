import { authRoutes } from "./auth.routes";
import { roomsRoutes } from "./rooms.routes";
import { messagesRoutes } from "./messages.routes";
import { usersRoutes } from "./users.routes";
import { authenticatedUserRoutes } from "./authenticated-user.routes";

export const routes = [
	authRoutes,
	roomsRoutes,
	messagesRoutes,
	usersRoutes,
	authenticatedUserRoutes,
];
