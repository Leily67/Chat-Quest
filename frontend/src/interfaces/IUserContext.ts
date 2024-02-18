//Gère l'état du nom d'utilisateur

import { type AuthResponse } from "@/services/api";
import { type IUser } from "./IUser";

export default interface IUserContext {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: IUser | null;
  auth: ({ user, token }: AuthResponse) => void;
  isLoaded: boolean;
  logout: () => void;
}
