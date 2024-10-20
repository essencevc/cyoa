import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { z } from 'zod';
import { Clerk } from '@clerk/clerk-js';

// Create an axios instance
export const api: AxiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:5000', // Adjust this to match your API base URL
  timeout: 10000, // Set a reasonable timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

const clerk = new Clerk( import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

export const getClerk = async () => {
    if(!clerk.loaded) {
        await clerk.load()
    }
    return clerk
}

export const makePostRequest = async <T extends z.ZodType<any, any>>(url: string, data: any, schema: T) => {
    const clerkObject = await getClerk()
    const session = clerkObject.user
    const token = await clerkObject.session?.getToken()
    if(!token) {
        throw new Error('No token found')
    }
    const response = await api.post(url, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    return schema.parse(JSON.parse(response.data))
}