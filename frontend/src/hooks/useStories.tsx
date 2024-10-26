import { env } from "@/lib/clientenvschemas";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { storyArraySchema } from "@/lib/schemas";
import { z } from "zod";

const apiClient = axios.create({
  baseURL: env.VITE_SERVER_URL,
});

const useStories = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: stories,
    isFetched: hasFetchedStories,
    refetch: refetchStories,
  } = useQuery({
    queryKey: ["stories"],
    refetchInterval: 20000,
    queryFn: async () => {
      const token = await getToken();

      const response = await apiClient.get<z.infer<typeof storyArraySchema>>(
        "/stories/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return storyArraySchema.parse(response.data);
    },
    throwOnError: true,
  });

  const { mutateAsync: createStory, isPending: isCreatingStory } = useMutation({
    mutationFn: async ({
      title,
      description,
    }: {
      title: string;
      description: string;
    }) => {
      const token = await getToken();
      const response = await apiClient.post(
        "/stories",
        { title, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onError: () => {
      toast.error("Failed to create story");
    },
    onSuccess: () => {
      toast.success("Story created successfully");
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });

  const { mutateAsync: deleteStory, isPending: isDeletingStory } = useMutation({
    mutationFn: async (storyId: number) => {
      const token = await getToken();
      const response = await apiClient.post(
        "/stories/delete",
        { story_id: storyId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Story deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
    onError: () => {
      toast.error("Failed to delete story");
    },
  });

  return {
    createStory,
    isCreatingStory,
    stories,
    hasFetchedStories,
    refetchStories,
    deleteStory,
    isDeletingStory,
  };
};

export default useStories;
