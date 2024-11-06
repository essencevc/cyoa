import {z} from 'zod'

export const storySchema = z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string(), 
    status: z.enum(['processing', 'failed', 'completed'])
})

export const storyNodeSchema = z.object({
    id: z.string().uuid(),
    parent_node_id: z.string().uuid().nullable(),
    //  TODO Add image_url later on
    image_url: z.string().nullable(),
    setting: z.string(),
    starting_choice: z.string(),
    choices: z.array(z.string()),
    consumed: z.boolean(),
    story_id: z.string().uuid(),
    status: z.enum(['processing', 'failed', 'completed'])
})

export const storyWithNodesSchema = storySchema.extend({
    story_nodes: z.array(storyNodeSchema)
})

export type StoryWithNodes = z.infer<typeof storyWithNodesSchema>;
export type StoryNode = z.infer<typeof storyNodeSchema>;

export type Story = z.infer<typeof storySchema>;
export const storyArraySchema = z.array(storySchema)