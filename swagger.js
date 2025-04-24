import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MIHU BACKEND API",
      version: "1.0.0",
    },
    components: {
      schemas: {
        RegisterUser: {
          type: "object",
          required: ["name", "email", "password", "confirmPassword"],
          properties: {
            name: { type: "string", minLength: 6, maxLength: 40 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            confirmPassword: { type: "string", minLength: 6 },
          },
        },
        VerifyEmail: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: { type: "string", format: "email" },
            otp: { type: "integer", minimum: 100000, maximum: 999999 },
          },
        },
        ResendOTP: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
          },
        },
        LoginUser: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
        },
        PasswordResetRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
          },
        },
        PasswordChange: {
          type: "object",
          required: ["oldPassword", "password", "confirmPassword"],
          properties: {
            oldPassword: { type: "string", minLength: 6 },
            password: { type: "string", minLength: 6 },
            confirmPassword: { type: "string", minLength: 6 },
          },
        },
        PasswordResetVerification: {
          type: "object",
          required: ["email", "otp", "password", "confirmPassword"],
          properties: {
            email: { type: "string", format: "email" },
            otp: { type: "integer", minimum: 100000, maximum: 999999 },
            password: { type: "string", minLength: 6 },
            confirmPassword: { type: "string", minLength: 6 },
          },
        },
        TwoFAToggle: {
          type: "object",
          required: ["action"],
          properties: {
            action: { type: "string", enum: ["enable", "disable"] },
            forceDisable: { type: "boolean", nullable: true },
          },
        },
        TwoFAEmail: {
          type: "object",
          required: ["twoFAEmail"],
          properties: {
            twoFAEmail: { type: "string", format: "email" },
          },
        },
        TwoFAVerify: {
          type: "object",
          required: ["twoFAEmail", "otp"],
          properties: {
            twoFAEmail: { type: "string", format: "email" },
            otp: { type: "integer", minimum: 100000, maximum: 999999 },
          },
        },
        PasswordResetVerification2FA: {
          type: "object",
          required: ["email", "otp", "password", "confirmPassword"],
          properties: {
            email: { type: "string", format: "email" },
            otp: { type: "integer", minimum: 100000, maximum: 999999 },
            password: { type: "string", minLength: 6 },
            confirmPassword: { type: "string", minLength: 6 },
          },
        },
        Post: {
          type: "object",
          properties: {
            title: {
              type: "string",
              minLength: 1,
              description: "Title of the post",
              nullable: true, // Optional
            },
            content: {
              type: "string",
              minLength: 1,
              maxLength: 500,
              description: "Content of the post",
            },
            imageUrl: {
              type: "string",
              format: "uri", // Valid URL format
              nullable: true, // Optional
              description: "Image URL associated with the post",
            },
          },
          required: ["content"], // Only content is required
        },
      },
    },
  },
  apis: [
    "./index.js",
    "./routes/**/*.js",
    "./controllers/*.js",
    "./controllers/docs/*.js",
  ],
};

export const swaggerDocs = swaggerJSDoc(options);
console.log(swaggerDocs);
