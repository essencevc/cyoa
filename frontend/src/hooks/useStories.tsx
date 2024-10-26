import { env } from "@/lib/clientenvschemas";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { storyArraySchema } from "@/lib/schemas";

const apiClient = axios.create({
  baseURL: env.VITE_SERVER_URL,
});

const useStories = () => {
  const { getToken } = useAuth();

  const {
    data: stories,
    isFetched: hasFetchedStories,
    refetch: refetchStories,
  } = useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const token = await getToken();

      const response = await apiClient.get("/stories/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
    },
  });

  console.log(stories);
  return {
    createStory,
    isCreatingStory,
    stories,
    hasFetchedStories,
    refetchStories,
  };
};

export default useStories;
