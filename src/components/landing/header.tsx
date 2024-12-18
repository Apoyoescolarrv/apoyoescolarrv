import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { User } from "@/types/user";
import { HeaderWrapper } from "./header-wrapper";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  const decoded = jwtDecode<User>(token);
  return decoded;
}

export async function Header() {
  const user = await getUser();
  return <HeaderWrapper user={user} />;
}
