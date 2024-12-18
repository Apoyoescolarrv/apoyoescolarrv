import { deleteCookie } from "cookies-next/client";
import { LOGOUT_EVENT } from "@/contexts/cart-context";

export function logout() {
  window.dispatchEvent(new Event(LOGOUT_EVENT));
  deleteCookie("token");
  window.location.href = "/";
}
