import {z} from 'zod'

export const storySchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    status: z.enum(['submitted', 'running', 'failed', 'completed']),
    updated_at: z.string().pipe(z.coerce.date())
})

export type Story = z.infer<typeof storySchema>;
export const storyArraySchema = z.array(storySchema)  