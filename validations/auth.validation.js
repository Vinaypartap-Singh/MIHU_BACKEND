import { z } from "zod";

export const registerSchemaValidation = z
  .object({
    name: z
      .string({ message: "Name is required" })
      .min(6, { message: "Min 6 Character" })
      .max(40, { message: "Maximum 40 character allowed in name" }),
    email: z
      .string({ message: "Email is required" })
      .email({ message: "please use the correct email" }),
    password: z
      .string({ message: "Password is required" })
      .min(6, { message: "password must be 6 characters" }),
    confirmPassword: z
      .string({ message: "Confirm Password is required" })
      .min(6, { message: "must be same as password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password does not match",
    path: ["confirmPassword"],
  });

export const verifyEmailSchema = z.object({
  email: z
    .string({ message: "email is required" })
    .email({ message: "Please use the correct email" }),
  otp: z
    .number()
    .int({ message: "OTP must be a number." })
    .min(100000, { message: "OTP must be at least 6 digits." })
    .max(999999, { message: "OTP must be at most 6 digits." }), // Ensures it is a six-digit OTP
});

export const reSendVerificationOTPSchema = z.object({
  email: z
    .string({ message: "email is required" })
    .email({ message: "Please use correct email" }),
});

export const loginSchemaValidation = z.object({
  email: z
    .string({ message: "Email is required" })
    .email({ message: "please use the correct email" }),
  password: z
    .string({ message: "Password is required" })
    .min(6, { message: "password must be 6 characters" }),
});

export const passwordResetRequestValidation = z.object({
  email: z.string({
    message: "Email is required",
  }),
});

export const passwordResetVerificationValidation = z
  .object({
    email: z
      .string({ message: "Email is required" })
      .email({ message: "please use the correct email" }),
    otp: z
      .number()
      .int({ message: "OTP must be a number." })
      .min(100000, { message: "OTP must be at least 6 digits." })
      .max(999999, { message: "OTP must be at most 6 digits." }), // Ensures it is a six-digit OTP
    password: z
      .string({ message: "Password is required" })
      .min(6, { message: "password must be 6 characters" }),
    confirmPassword: z
      .string({ message: "Confirm Password is required" })
      .min(6, { message: "must be same as password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password does not match.",
    path: ["confirmPassword"],
  });
