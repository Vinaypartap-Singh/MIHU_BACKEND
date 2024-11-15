import { z } from "zod";

// Zod schema for validating Post data
export const postSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(500, "Content cannot exceed 500 characters"), // Adjust the max length as needed
  imageUrl: z.string().url().optional(), // Optional and must be a valid URL if provided
  authorId: z.string().uuid("Invalid user ID format"), // Assuming authorId is a UUID
});
