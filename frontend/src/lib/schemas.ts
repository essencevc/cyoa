import {z} from 'zod'

export const storySchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    status: z.enum(['submitted', 'running', 'failed', 'completed']),
    updated_at: z.string().pipe(z.coerce.date())
})

export const storyNodeSchema = z.object({
    node_id: z.number(),
    parent_node_id: z.number().nullable(),
    //  TODO Add image_url later on
    image_url: z.string().nullable(),
    setting: z.string(),
    choices: z.array(z.string()),
    consumed: z.boolean()
})

export const storyWithNodesSchema = storySchema.extend({
    story_nodes: z.array(storyNodeSchema)
})

export type StoryWithNodes = z.infer<typeof storyWithNodesSchema>;

export type Story = z.infer<typeof storySchema>;
export const storyArraySchema = z.array(storySchema)  