import { env } from "@/lib/clientenvschemas";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { useToast } from "./use-toast";

const apiClient = axios.create({
  baseURL: env.VITE_SERVER_URL,
});

const creditSchema = z.object({
  credits: z.number(),
});

const useUserCredits = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const { data, isFetching: isFetchingCredits } = useQuery({
    queryKey: ["userCredits"],
    queryFn: async () => {
      const token = await getToken();
      try {
        const response = await apiClient.get("/user/get_credits", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data);
        return creditSchema.parse(response.data);
      } catch (error) {
        toast({
          title: "Error Encountered",
          description: "Failed to fetch user credits",
        });
        throw error;
      }
    },
    enabled: user !== null,
  });

  return {
    credits: data?.credits,
    isLoading: isFetchingCredits || !user,
  };
};

export default useUserCredits;
