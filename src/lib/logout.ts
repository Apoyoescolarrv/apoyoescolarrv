import { deleteCookie } from "cookies-next/client";

export function logout() {
  deleteCookie("token");
  window.location.href = "/login";
}
