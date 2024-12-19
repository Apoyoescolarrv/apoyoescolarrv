import axios, { InternalAxiosRequestConfig } from "axios";
import { PREFIX } from "./constants";
import { logout } from "./logout";

const baseURL = `${PREFIX}/api`;

// Cliente HTTP para el navegador
export const http = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Solo agregar el interceptor si estamos en el cliente
if (typeof window !== "undefined") {
  http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (token) {
      config.headers.set("authorization", `Bearer ${token}`);
    }
    return config;
  });

  // Interceptor de respuesta para manejar 401
  http.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );
}

// Cliente HTTP para el servidor
export const createServerHttp = (token: string) => {
  const serverHttp = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  return serverHttp;
};
