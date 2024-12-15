export interface Course {
  id: string;
  title: string;
  description?: string;
  categoryId?: string;
  price: number;
  isActive: boolean;
  thumbnail?: string;
  previewVideoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoursesResponse {
  courses: Course[];
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}

export interface CourseResponse {
  course: Course;
}
