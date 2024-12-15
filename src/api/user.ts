import { http } from "@/lib/http";
import { User } from "@/types/user";

interface UserResponse {
  user: User | null;
}

export const getCurrentUser = async () => {
  console.log("here");
  try {
    const { data } = await http.get<UserResponse>("/user");
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
    return { user: null };
  }
};
