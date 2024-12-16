export interface Class {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  duration: number | null;
  isPreview: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassResponse {
  class: Class;
}
