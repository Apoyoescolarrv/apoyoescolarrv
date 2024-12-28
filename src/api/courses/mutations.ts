import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CoursesService } from "./service";
import { http } from "@/lib/http";

export const useCreateCourseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CoursesService.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useUpdateCourseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CoursesService.updateCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useDeleteCourseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CoursesService.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useUploadThumbnailMutation = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await http.post("/courses/upload", formData);
      return response.data.url as string;
    },
  });
};

export const useDeleteThumbnailMutation = () => {
  return useMutation({
    mutationFn: async (url: string) => {
      await http.delete(`/courses/upload?url=${encodeURIComponent(url)}`);
    },
  });
};

export const useUpdateCourseProgressMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      slug,
      progress,
    }: {
      slug: string;
      progress: number;
    }) => CoursesService.updateCourseProgress(slug, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useSaveVideoProgressMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      slug,
      lessonId,
      seconds,
      completed,
    }: {
      slug: string;
      lessonId: string;
      seconds: number;
      completed: boolean;
    }) => CoursesService.saveVideoProgress(slug, lessonId, seconds, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};
