import { z } from "zod";

export const storySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  status: z.enum(["processing", "failed", "completed"]),
  updated_at: z.coerce.date(),
  banner_image_url: z.string().nullable(),
});

export const StoryNodeBaseSchema = z.object({
  id: z.string(),
  choice_text: z.string(),
  parent_node_id: z.string().nullable(),
  image_url: z.string().nullable(),
  setting: z.string(),
  consumed: z.boolean(),
});

export const storyNodeSchema = StoryNodeBaseSchema.extend({
  children: z.array(StoryNodeBaseSchema),
});

export const storyWithNodesSchema = storySchema.extend({
  story_nodes: z.array(StoryNodeBaseSchema),
});
export const storyArraySchema = z.array(storySchema);

export type StoryWithNodes = z.infer<typeof storyWithNodesSchema>;
export type StoryNodeWithChildren = z.infer<typeof storyNodeSchema>;
export type StoryNode = z.infer<typeof StoryNodeBaseSchema>;

export type Story = z.infer<typeof storySchema>;
