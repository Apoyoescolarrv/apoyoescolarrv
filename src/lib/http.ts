import axios from "axios";

import { PREFIX } from "./constants";
import { cookies } from "./cookies";

const apiURL = `${PREFIX}/api`;

export const http = axios.create({
  baseURL: apiURL,
});

http.interceptors.request.use((config) => {
  const token = cookies.get("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
