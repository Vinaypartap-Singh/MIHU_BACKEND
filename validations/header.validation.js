import { z } from "zod";

export const headerSchema = z.object({
  title: z.string().default("Mihu"),
  headerButtonTitle: z.string().min(1, "Header button title is required."),
  headerButtonUrl: z.string().url("Invalid URL format."),

  // Basic Information
  name: z.string().min(1, "Store name is required."),
  tagline: z.string().optional(),

  // Address Information
  address: z.string().min(1, "Address is required."),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State is required."),
  country: z.string().min(1, "Country is required."),
  postalCode: z.string().min(1, "Postal code is required."),

  // Contact Information
  phone: z
    .string()
    .min(10, "Phone number must have at least 10 digits.")
    .max(15, "Phone number must have at most 15 digits.")
    .regex(/^[0-9]+$/, "Phone number must contain only numbers."),
  contactEmail: z.string().email("Invalid email format."),

  // Business Details
  businessType: z.string().min(1, "Business type is required."),
  registrationNumber: z.string().optional(),
  taxId: z.string().optional(),

  // Policies
  returnPolicy: z.string().optional(),
  shippingPolicy: z.string().optional(),
  privacyPolicy: z.string().optional(),

  // Optional Media
  coverImage: z.string().url("Invalid URL format for cover image.").optional(),
  photos: z.array(z.string().url("Invalid URL format for photos.")).optional(),

  // Metadata
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional(),
});

export const socialMediaSchema = z.object({
  platform: z
    .string()
    .min(1, { message: "Platform is required" })
    .max(50, { message: "Platform must be 50 characters or fewer" })
    .refine(
      (val) =>
        ["Facebook", "Instagram", "Twitter", "LinkedIn", "YouTube"].includes(
          val
        ),
      {
        message:
          "Platform must be one of Facebook, Instagram, Twitter, LinkedIn, or YouTube",
      }
    ),
  username: z
    .string()
    .min(1, { message: "Username is required" })
    .max(100, { message: "Username must be 100 characters or fewer" }),
});

export const navigationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Invalid URL format"),
});
