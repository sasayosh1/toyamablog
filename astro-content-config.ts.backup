import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    publishedAt: z.string().transform((str) => new Date(str)),
    description: z.string().optional(),
    category: z.string(),
    tags: z.array(z.string()).default(['富山']),
    youtubeShorts: z.string().optional(),
  }),
});

export const collections = {
  blog,
};
