import { createServerHttp, http } from "@/lib/http";

export interface AdminStats {
  categories: number;
  courses: number;
  users: number;
}

export interface AdminData {
  stats: {
    categories: number;
    courses: number;
    users: number;
    classes: number;
  };
}

// Para uso en el cliente
export const getAdminData = async (): Promise<AdminData> => {
  const { data } = await http.get<AdminData>("/admin-stats");
  return data;
};

// Para uso en el servidor
export const getServerAdminData = async (token: string): Promise<AdminData> => {
  const serverHttp = createServerHttp(token);
  const { data } = await serverHttp.get<AdminData>("/admin-stats");
  return data;
};
