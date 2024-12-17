export interface CourseBasics {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  isActive: boolean;
  whatsappGroupId: string;
  thumbnail: string;
}

export interface CourseModule {
  id?: string;
  title: string;
  order: number;
  courseId?: string;
}

export interface ModuleClass {
  id?: string;
  moduleId?: string;
  classId: string;
  order: number;
}

export interface Course extends CourseBasics {
  id: string;
  modules: (CourseModule & {
    moduleClasses?: ModuleClass[];
  })[];
  category?: {
    id: string;
    name: string;
  };
  totalDuration?: number;
  _count: {
    modules: number;
    students: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CourseFormData {
  basics: CourseBasics;
  modules: CourseModule[];
  classes: Record<string, ModuleClass[]>;
}

export interface CreateCourseModule {
  title: string;
  order: number;
  classes?: {
    classId: string;
    order: number;
  }[];
}

export interface CreateCourseData extends CourseBasics {
  modules: CreateCourseModule[];
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
