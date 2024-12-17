import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClassesService } from "./service";

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

export const useUploadMediaMutation = () => {
  return useMutation({
    mutationFn: ClassesService.uploadMedia,
  });
};

export const useDeleteMediaMutation = () => {
  return useMutation({
    mutationFn: ClassesService.deleteMedia,
  });
};
