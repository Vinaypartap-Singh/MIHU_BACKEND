import { z } from "zod";

// Zod schema for validating Post data
export const postSchema = z.object({
  title: z
    .string({ message: "Title is required" })
    .min(1, "Title is required")
    .optional(),
  content: z
    .string()
    .min(1, "Content is required")
    .max(500, "Content cannot exceed 500 characters"), // Adjust the max length as needed
  imageUrl: z.string().url().optional(), // Optional and must be a valid URL if provided
});
