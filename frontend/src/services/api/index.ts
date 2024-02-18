import { type IUser } from "@/interfaces/IUser";

export enum Method {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export type AuthResponse = {
  user: IUser;
  token: string;
};

type Options = {
  method: string;
  headers: {
    "Content-Type": string;
    "x-api-key": string;
    Authorization?: string;
  };
  body?: string;
};

export const api = (
  endpoint: string,
  method: Method = Method.GET,
  body?: any
): Promise<Response> => {
  const token = localStorage.getItem("token") || null;

  let options: Options = {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
    },
  };

  if (body) {
    options = {
      ...options,
      body: JSON.stringify(body),
    };
  }

  if (token) {
    options = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    };
  }

  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, options);
};
