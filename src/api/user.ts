import { http } from "@/lib/http";
import { User } from "@/types/user";

interface UserResponse {
  user: User | null;
}

export const getCurrentUser = async () => {
  try {
    const { data } = await http.get<UserResponse>("/user");
    return data;
  } catch {
    return { user: null };
  }
};
