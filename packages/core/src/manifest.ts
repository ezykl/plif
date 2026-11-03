import { z } from "zod";

export const pageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().optional(),
  density: z.enum(["hard", "soft"]).optional(),
});

export const manifestSchema = z.object({
  version: z.literal(1),
  title: z.string().min(1),
  pageSize: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
  }),
  hasCover: z.boolean().default(true),
  pages: z.array(pageSchema).min(1),
});

export type Manifest = z.infer<typeof manifestSchema>;

export function parseManifest(input: unknown): Manifest {
  return manifestSchema.parse(input);
}
