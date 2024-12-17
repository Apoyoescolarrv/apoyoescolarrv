import { courses } from "@/db/schema";
import { http } from "@/lib/http";
import {
  Course,
  CourseModule,
  CourseResponse,
  CoursesResponse,
  ModuleClass,
} from "@/types/course";
import { Filter } from "@/types/filters";

export interface CreateCourseBasicData {
  title: string;
  description?: string;
  categoryId?: string;
  price: number;
  isActive: boolean;
  thumbnail?: string;
  previewVideoUrl?: string;
  whatsappGroupId?: string;
}

export interface CreateCourseData extends CreateCourseBasicData {
  modules: (Omit<CourseModule, "courseId"> & {
    classes: ModuleClass[];
  })[];
}

export const CoursesService = {
  getCourses: async (
    page = 1,
    limit = 10,
    search?: string,
    filters: Filter<(typeof courses._)["columns"]>[] = []
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    if (filters.length > 0) {
      params.append("filters", JSON.stringify(filters));
    }

    const { data } = await http.get<CoursesResponse>(`/courses?${params}`);
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
