import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClassesService } from "./service";
import { http } from "@/lib/http";

export const useCreateClassMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ClassesService.createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["classes"],
        exact: false,
      });
    },
  });
};

export const useUpdateClassMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ClassesService.updateClass,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["classes"],
        exact: false,
      });
    },
  });
};

export const useDeleteClassMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ClassesService.deleteClass,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["classes"],
        exact: false,
      });
    },
  });
};

export const useUploadVideoMutation = () => {
  return useMutation({
    mutationFn: ClassesService.uploadVideo,
  });
};

export const useDeleteVideoMutation = () => {
  return useMutation({
    mutationFn: async (url: string) => {
      await http.delete(`/classes/upload?url=${encodeURIComponent(url)}`);
    },
  });
};
