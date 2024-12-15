import axios from "axios";
import { getCookie as getCookieClient } from "cookies-next/client";
import { PREFIX } from "./constants";

export const http = axios.create({
  baseURL: `${PREFIX}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (config: any) => {
    const token = getCookieClient("token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
