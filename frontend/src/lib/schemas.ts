import {z} from 'zod'

export const storySchema = z.object({
    title: z.string(),
    content: z.string(),
    mainCharacter: z.string(),
})

export const storyResponseSchema = z.object({
    story_id: z.string(),
    setting: z.string(),
    choices: z.array(z.object({
        is_terminal: z.boolean(),
        choice_text: z.string(),
    })),
})

export const storyGenerationAcknowledgementSchema = z.object({
    invocationId: z.string(),
    status: z.enum(['Accepted']),
    story_id: z.string(),
})