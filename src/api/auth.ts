import { http } from "@/lib/http";

export const Login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const { data } = await http.post("/auth/login", {
    email,
    password,
  });
  return data;
};

export const SignUp = async ({
  name,
  email,
  password,
  phoneNumber,
}: {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
}) => {
  const { data } = await http.post("/auth/signup", {
    name,
    email,
    password,
    phoneNumber,
  });
  return data;
};
