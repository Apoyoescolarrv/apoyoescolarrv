import { Class } from "./class";

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  modules: CourseModule[];
  thumbnail?: string;
  previewVideoUrl?: string;
}

export interface CourseModule {
  id?: string;
  courseId?: string;
  title: string;
  order: number;
  moduleClasses?: ModuleClass[];
}

export interface ModuleClass {
  id?: string;
  moduleId?: string;
  classId: string;
  order: number;
  class?: Class;
}

export interface CourseFormData {
  basics: {
    title: string;
    description: string;
    price: number;
    categoryId: string;
    isActive: boolean;
  };
  modules: CourseModule[];
  classes: Record<string, ModuleClass[]>;
}

export interface CourseResponse {
  course: Course;
}

export interface CoursesResponse {
  data: Course[];
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}
