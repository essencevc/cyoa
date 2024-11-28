import { env } from "@/lib/clientenvschemas";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { z } from "zod";

const apiClient = axios.create({
  baseURL: env.VITE_SERVER_URL,
});

const creditSchema = z.object({
  credits: z.number(),
});

const useUserCredits = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { user, isLoaded } = useUser();

  const {
    data,
    isFetching: isFetchingCredits,
    refetch,
  } = useQuery({
    queryKey: ["userCredits"],
    queryFn: async () => {
      const token = await getToken();
      try {
        const response = await apiClient.get("/user/get_credits", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return creditSchema.parse(response.data);
      } catch (error) {
        toast.error("Failed to fetch user credits");
        throw error;
      }
    },
    enabled: isLoaded,
  });

  return {
    credits: data?.credits,
    isLoading: isFetchingCredits || !isLoaded,
  };
};

export default useUserCredits;
