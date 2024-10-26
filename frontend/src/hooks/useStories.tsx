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
import { storyArraySchema, storyWithNodesSchema } from "@/lib/schemas";
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

  const getStory = (storyId: string | undefined) => {
    if (!storyId) {
      throw new Error("Story ID is required");
    }

    return useQuery({
      queryKey: ["story", storyId],
      queryFn: async () => {
        if (!storyId) return null;
        const token = await getToken();
        const response = await apiClient.get(`/stories/${storyId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return storyWithNodesSchema.parse(response.data);
      },
      enabled: !!storyId,
    });
  };

  const getStoryNode = (
    storyId: string | undefined,
    nodeId: string | undefined
  ) => {
    if (!storyId || !nodeId) {
      throw new Error("Story ID and Node ID are required");
    }

    return useQuery({
      queryKey: ["storyNode", storyId, nodeId],
      queryFn: async () => {
        const token = await getToken();
        const response = await apiClient.get(`/stories/${storyId}/${nodeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data;
      },
      enabled: !!storyId && !!nodeId,
    });
  };

  return {
    createStory,
    isCreatingStory,
    stories,
    hasFetchedStories,
    refetchStories,
    deleteStory,
    isDeletingStory,
    getStory,
    getStoryNode,
  };
};

export default useStories;
