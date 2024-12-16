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

export interface CoursesResponse {
  data: Course[];
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
