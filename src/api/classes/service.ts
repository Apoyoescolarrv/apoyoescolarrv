import { http } from "@/lib/http";
import {
  ClassResponse,
  ClassesResponse,
  CreateClassDto,
  UpdateClassDto,
} from "@/types/class";

export class ClassesService {
  static async getClasses(page = 1, limit = 10, search = "") {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    const { data } = await http.get<ClassesResponse>(`/classes?${params}`);
    return data;
  }

  static async getClass(id: string) {
    const { data } = await http.get<ClassResponse>(`/classes/${id}`);
    return data.class;
  }

  static async createClass(dto: CreateClassDto) {
    const { data } = await http.post<ClassResponse>("/classes", dto);
    return data.class;
  }

  static async updateClass({ id, ...dto }: UpdateClassDto) {
    const { data } = await http.patch<ClassResponse>(`/classes/${id}`, dto);
    return data.class;
  }

  static async deleteClass(id: string) {
    await http.delete(`/classes/${id}`);
  }

  static async uploadMedia(data: FormData) {
    const { data: response } = await http.post<{ url: string }>(
      "/classes/upload",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  }

  static async deleteMedia(url: string) {
    await http.delete(`/classes/upload?url=${encodeURIComponent(url)}`);
  }
}
