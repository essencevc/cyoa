import { env } from "@/lib/clientenvschemas";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  storyArraySchema,
  storyNodeSchema,
  storyWithNodesSchema,
} from "@/lib/schemas";
import { z } from "zod";
import { useToast } from "./use-toast";

const apiClient = axios.create({
  baseURL: env.VITE_SERVER_URL,
});

interface CreateStoryParams {
  title: string;
  description: string;
}

const useStories = () => {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addAuthHeader = async () => ({
    headers: { Authorization: `Bearer ${await getToken()}` },
  });

  const {
    data: stories,
    isFetched: hasFetchedStories,
    refetch: refetchStories,
  } = useQuery({
    queryKey: ["stories"],
    refetchInterval: 20000,
    queryFn: async () => {
      const response = await apiClient.get<z.infer<typeof storyArraySchema>>(
        "/stories/",
        await addAuthHeader()
      );

      return storyArraySchema
        .parse(response.data)
        .sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime());
    },
    throwOnError: true,
  });

  const { mutateAsync: createStory, isPending: isCreatingStory } = useMutation({
    mutationFn: async ({ title, description }: CreateStoryParams) => {
      const response = await apiClient.post(
        "/stories/",
        { title, description },
        await addAuthHeader()
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Starting to create Story",
      });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
    onError: (e) => {
      console.log(e);
      toast({
        variant: "destructive",
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to create story",
      });
    },
  });

  const { mutateAsync: deleteStory, isPending: isDeletingStory } = useMutation({
    mutationFn: async (storyId: string) => {
      const response = await apiClient.post(
        "/stories/delete",
        { id: storyId },
        await addAuthHeader()
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        description: "Story deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
    onError: () =>
      toast({
        description: "Failed to delete story",
      }),
  });

  const { mutateAsync: copyStory, isPending: isCopyingStory } = useMutation({
    mutationFn: async (storyId: string) => {
      if (!storyId) {
        return;
      }
      const response = await apiClient.post(
        `/stories/copy/${storyId}`,
        {},
        await addAuthHeader()
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        description: "Story copied successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
    onError: () =>
      toast({
        description: "Failed to copy story",
        variant: "destructive",
      }),
  });

  const getStory = (storyId: string | undefined) =>
    useQuery({
      queryKey: ["story", storyId],
      enabled: !!storyId,
      retry: (failureCount, error) => {
        if (error?.response?.status === 404) return false;
        return failureCount < 3;
      },
      queryFn: async () => {
        if (!storyId) return null;
        const response = await apiClient.get(
          `/stories/${storyId}`,
          await addAuthHeader()
        );

        return storyWithNodesSchema.parse(response.data);
      },
    });

  const getStoryNode = (
    storyId: string | undefined,
    nodeId: string | undefined
  ) =>
    useQuery({
      queryKey: ["storyNode", storyId, nodeId],
      enabled: !!storyId && !!nodeId,
      throwOnError: true,
      queryFn: async () => {
        if (!storyId || !nodeId) return null;
        const response = await apiClient.get(
          `/stories/${storyId}/${nodeId}`,
          await addAuthHeader()
        );
        return storyNodeSchema.parse(response.data);
      },
    });

  const resolveStoryNode = async (
    storyId: string | undefined,
    choice: string | undefined
  ) => {
    if (!storyId || !choice)
      throw new Error("Story ID and choice are required");
    const response = await apiClient.post(
      "/stories/resolve_node",
      { story_id: storyId, choice },
      await addAuthHeader()
    );
    return response.data;
  };

  const getRandomStory = async () => {
    const response = await apiClient.post(
      "/stories/get_random_story",
      {},
      await addAuthHeader()
    );
    return response.data;
  };

  const { mutateAsync: toggleVisibility, isPending: isTogglingVisibility } =
    useMutation({
      mutationFn: async (storyId: string) => {
        const response = await apiClient.post(
          `/stories/toggle_visibility?story_id=${storyId}`,
          {},
          await addAuthHeader()
        );
        return response.data;
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Visibility updated successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["stories"] });
      },
      onMutate: async (storyId) => {
        await queryClient.cancelQueries({ queryKey: ["story", storyId] });
        const previousStory = queryClient.getQueryData(["story", storyId]);

        queryClient.setQueryData(["story", storyId], (old: any) => ({
          ...old,
          public: !old.public,
        }));

        return { previousStory };
      },
      onError: (e) =>
        toast({
          variant: "destructive",
          title: "Error",
          description:
            e instanceof Error ? e.message : "Failed to update visibility",
        }),
    });

  return {
    stories,
    hasFetchedStories,
    refetchStories,
    createStory,
    isCreatingStory,
    deleteStory,
    isDeletingStory,
    getStory,
    getStoryNode,
    resolveStoryNode,
    getRandomStory,
    toggleVisibility,
    isTogglingVisibility,
    copyStory,
    isCopyingStory,
  };
};

export default useStories;
