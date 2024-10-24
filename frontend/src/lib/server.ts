import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';

// Create an axios instance
export const api: AxiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:5000', // Adjust this to match your API base URL
  timeout: 10000, // Set a reasonable timeout
  headers: {
    'Content-Type': 'application/json',
  },
});


export const makePostRequest = async <T extends z.ZodType<any, any>>(url: string, data: any, token:string, schema: T) => {
    
    if(!token) {
        throw new Error('No token found')
    }
    const response = await api.post(url, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    return schema.parse(response.data)
}