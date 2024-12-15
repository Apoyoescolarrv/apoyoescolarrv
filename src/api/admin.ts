import { http, createServerHttp } from "@/lib/http";
import { Category } from "@/types/category";
import { Course } from "@/api/courses";

export interface AdminStats {
  categories: number;
  courses: number;
  users: number;
}

export interface AdminData {
  stats: AdminStats;
  categories: Category[];
  courses: Course[];
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
