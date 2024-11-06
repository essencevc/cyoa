import {z} from 'zod'

export const envSchema = z.object({
    VITE_CLERK_PUBLISHABLE_KEY: z.string(),
    VITE_SERVER_URL: z.string().default(''),
})

export const env = envSchema.parse(import.meta.env);