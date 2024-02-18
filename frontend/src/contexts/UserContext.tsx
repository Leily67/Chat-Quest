"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { IUser } from "@/interfaces/IUser";
import IUserContext from "@/interfaces/IUserContext";
import { type AuthResponse, api, Method } from "@/services/api";
import { createContext, useContext, useEffect, useReducer } from "react";

const INITIALIZE = "INITIALIZE";
const SIGN_IN = "SIGN_IN";
const SIGN_OUT = "SIGN_OUT";
const SIGN_UP = "SIGN_UP";

const initalData: IUserContext = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  auth: () => {},
  isLoaded: false,
  logout: () => {},
};

const BCReducer = (
  state: {
    isAuthenticated: boolean;
    isInitialized: boolean;
    user: IUser | null;
    isLoaded: boolean;
  },
  action: any
) => {
  switch (action.type) {
    case INITIALIZE:
      return {
        isAuthenticated: action.payload.isAuthenticated,
        isInitialized: true,
        user: action.payload.user,
        isLoaded: true,
      };
    case SIGN_IN:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        isLoaded: true,
      };
    case SIGN_OUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoaded: true,
      };

    case SIGN_UP:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        isLoaded: true,
      };
    default:
      return state;
  }
};

const UserContext = createContext<IUserContext>(initalData);

export function useUser() {
  const context = useContext(UserContext);
  return {
    ...context,
  };
}

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(BCReducer, initalData);
  const { setItem } = useLocalStorage();

  const auth = ({ user, token }: { user: IUser; token: string }) => {
    setItem("token", token);
    setItem("user", JSON.stringify(user));
    dispatch({
      type: SIGN_IN,
      payload: {
        user,
      },
    });
  };

  useEffect(() => {
    api("/authenticated-user/me")
      .then((res) => res.json())
      .then((data: AuthResponse) => {
        if (data && data.user && data.token) {
          setItem("user", JSON.stringify(data.user));
          setItem("token", data.token);

          dispatch({
            type: INITIALIZE,
            payload: {
              isAuthenticated: true,
              isInitialized: true,
              user: data.user,
            },
          });
        } else {
          dispatch({
            type: INITIALIZE,
            payload: {
              isAuthenticated: false,
              isInitialized: true,
              user: null,
            },
          });
        }
      })
      .catch(() => {
        dispatch({
          type: INITIALIZE,
          payload: {
            isAuthenticated: false,
            isInitialized: true,
            user: null,
          },
        });
      });
  }, []);

  useEffect(() => {
    if (
      state.isLoaded &&
      !state.isAuthenticated &&
      state.user === null &&
      location.pathname !== "/"
    ) {
      location.href = "/";
    } else if (
      state.isLoaded &&
      state.isAuthenticated &&
      state.user &&
      location.pathname === "/"
    ) {
      location.href = "/chat";
    }
  }, [state.isLoaded]);

  const logout = async (): Promise<void> => {
    try {
      await api("/auth/sign-out", Method.POST);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      dispatch({
        type: SIGN_OUT,
        payload: {},
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        ...state,
        auth,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
