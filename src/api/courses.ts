import { http } from "@/lib/http";

export interface Course {
  id: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  thumbnail: string | null;
  previewVideoUrl: string | null;
}

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

export const getCourses = async (page = 1, limit = 10) => {
  const { data } = await http.get<CoursesResponse>(
    `/courses?page=${page}&limit=${limit}`
  );
  return data;
};

export const createCourse = async (courseData: Partial<Course>) => {
  const { data } = await http.post<CourseResponse>("/courses", courseData);
  return data;
};

export const updateCourse = async (id: string, courseData: Partial<Course>) => {
  const { data } = await http.put<CourseResponse>(`/courses/${id}`, courseData);
  return data;
};

export const deleteCourse = async (id: string) => {
  const { data } = await http.delete<CourseResponse>(`/courses/${id}`);
  return data;
};
