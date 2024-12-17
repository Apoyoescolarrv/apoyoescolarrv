import { http } from "@/lib/http";
import {
  Course,
  CourseModule,
  ModuleClass,
  CoursesResponse,
  CourseResponse,
} from "@/types/course";

export interface CreateCourseBasicData {
  title: string;
  description?: string;
  categoryId?: string;
  price: number;
  isActive: boolean;
  thumbnail?: string;
  previewVideoUrl?: string;
}

export interface CreateCourseData extends CreateCourseBasicData {
  modules: (Omit<CourseModule, "courseId"> & {
    classes: ModuleClass[];
  })[];
}

export const CoursesService = {
  getCourses: async (page = 1, limit = 10, search?: string) => {
    const { data } = await http.get<CoursesResponse>(
      `/courses?page=${page}&limit=${limit}${search ? `&search=${search}` : ""}`
    );
    return data;
  },

  getCourse: async (id: string) => {
    const { data } = await http.get<CourseResponse>(`/courses/${id}`);
    return data.course;
  },

  createCourse: async (courseData: CreateCourseBasicData) => {
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
