import { http } from "@/lib/http";
import { Course } from "@/types/courses";

interface CoursesResponse {
  courses: Course[];
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}

interface CourseResponse {
  course: Course;
}

export const CoursesService = {
  getCourses: async (page = 1, limit = 10) => {
    const { data } = await http.get<CoursesResponse>(
      `/courses?page=${page}&limit=${limit}`
    );
    return data.courses;
  },

  createCourse: async (courseData: Partial<Course>) => {
    const { data } = await http.post<CourseResponse>("/courses", courseData);
    return data.course;
  },

  updateCourse: async ({
    id,
    ...courseData
  }: { id: string } & Partial<Course>) => {
    const { data } = await http.put<CourseResponse>(
      `/courses/${id}`,
      courseData
    );
    return data.course;
  },

  deleteCourse: async (id: string) => {
    const { data } = await http.delete<CourseResponse>(`/courses/${id}`);
    return data.course;
  },
};
