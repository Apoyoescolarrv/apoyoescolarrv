import { http } from "@/lib/http";
import { Class, ClassResponse } from "@/types/class";

interface ClassesResponse {
  data: Class[];
  pagination: {
    total: number;
    totalPages: number;
  };
}

interface UploadResponse {
  url: string;
}

export const ClassesService = {
  getClasses: async (page = 1, limit = 10, search?: string) => {
    const { data } = await http.get<ClassesResponse>(
      `/classes?page=${page}&limit=${limit}${search ? `&search=${search}` : ""}`
    );
    return data;
  },

  getClass: async (id: string) => {
    const { data } = await http.get<ClassResponse>(`/classes/${id}`);
    return data.class;
  },

  createClass: async (
    classData: Omit<Class, "id" | "createdAt" | "updatedAt">
  ) => {
    const { data } = await http.post<ClassResponse>("/classes", classData);
    return data.class;
  },

  updateClass: async ({
    id,
    ...classData
  }: Partial<Class> & { id: string }) => {
    const { data } = await http.put<ClassResponse>(`/classes`, {
      id,
      ...classData,
    });
    return data.class;
  },

  deleteClass: async (id: string) => {
    const { data } = await http.delete<ClassResponse>(`/classes?id=${id}`);
    return data.class;
  },

  uploadVideo: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await http.post<UploadResponse>(
      "/classes/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  },
};
