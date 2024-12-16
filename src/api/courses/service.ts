import { http } from "@/lib/http";
import { CoursesResponse, CourseResponse, Course } from "@/types/courses";

export const CoursesService = {
  getCourses: async (page = 1, limit = 10, search?: string) => {
    const { data } = await http.get<CoursesResponse>(
      `/courses?page=${page}&limit=${limit}${search ? `&search=${search}` : ""}`
    );
    return data;
  },

  createCourse: async (
    courseData: Omit<Course, "id" | "createdAt" | "updatedAt">
  ) => {
    const { data } = await http.post<CourseResponse>("/courses", courseData);
    return data.course;
  },

  updateCourse: async ({
    id,
    ...courseData
  }: Partial<Course> & { id: string }) => {
    const { data } = await http.put<CourseResponse>(`/courses`, {
      id,
      ...courseData,
    });
    return data.course;
  },

  deleteCourse: async (id: string) => {
    const { data } = await http.delete<CourseResponse>(`/courses?id=${id}`);
    return data.course;
  },
};
