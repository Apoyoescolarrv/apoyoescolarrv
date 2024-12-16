export interface Class {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  videoUrl: string;
  duration: number | null;
  isPreview: boolean;
  order: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClassesResponse {
  data: Class[];
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}

export interface ClassResponse {
  class: Class;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number | null;
}

export interface ModulesResponse {
  data: Module[];
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}

export interface UserProgress {
  id: string;
  userId: string;
  classId: string;
  completed: boolean;
  progressTime: number;
  lastWatchedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProgressResponse {
  progress: UserProgress;
}
