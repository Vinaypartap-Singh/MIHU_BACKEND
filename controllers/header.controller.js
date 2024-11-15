import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { handleCatchError, handleTryResponseError } from "../helper.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import prisma from "../db/db.config.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";
import {
  headerSchema,
  navigationSchema,
  socialMediaSchema,
} from "../validations/header.validation.js";

const headerHandler = Router();

// Update Store Information
headerHandler.post("/storeInfo", authMiddleware, async (req, res) => {
  try {
    const body = req.body;
    const payload = headerSchema.parse(body);
    const user_id = req.user;
    const user = await prisma.user.findUnique({
      where: {
        id: user_id,
      },
    });

    if (!user) return handleTryResponseError(res, 400, "Unauthorized Access");

    // Check if the user's email is verified before allowing store info setup
    if (!user.emailVerified) {
      return handleTryResponseError(
        res,
        400,
        "Please verify your account to add store information"
      );
    }

    const existingHeader = await prisma.header.findUnique({
      where: {
        user_id: user_id,
      },
    });

    if (existingHeader) {
      await prisma.header.update({
        where: { id: existingHeader.id },
        data: { ...payload, user_id: user.id },
      });
      return handleTryResponseError(
        res,
        200,
        "Store information updated successfully"
      );
    } else {
      await prisma.header.create({
        data: { ...payload, user_id: user.id },
      });
      return handleTryResponseError(
        res,
        201,
        "Store information created successfully"
      );
    }
  } catch (error) {
    return handleCatchError(error, res, "Error while adding store information");
  }
});

// Upload Store Logo
headerHandler.post(
  "/storeLogo",
  upload.single("storeLogo"),
  authMiddleware,
  async (req, res) => {
    try {
      const user_id = req.user;

      const user = await prisma.user.findUnique({
        where: {
          id: user_id,
        },
      });

      if (!user) {
        return handleTryResponseError(res, 400, "UnAuthorized Access");
      }

      if (!user.emailVerified) {
        return handleTryResponseError(
          res,
          400,
          "Please verify your account in order to upload profile image"
        );
      }

      if (!req.file) {
        return handleTryResponseError(
          res,
          400,
          "No file uploaded. Please attach a store logo."
        );
      }

      const storeLogoLocalPath = req.file.path;
      const storeLogo = await uploadOnCloudinary(storeLogoLocalPath);

      if (!storeLogo) {
        return handleTryResponseError(
          res,
          400,
          "Error while uploading Store Logo. Please try again"
        );
      }

      await prisma.header.create({
        data: {
          storeLogo: storeLogo,
          user_id: user.id,
        },
      });

      return handleTryResponseError(
        res,
        200,
        "Store Logo Uploaded Successfully"
      );
    } catch (error) {
      return handleCatchError(
        error,
        res,
        "Error While Setting Up Store Information"
      );
    }
  }
);

// Add Social Media
headerHandler.post("/socialMedia", authMiddleware, async (req, res) => {
  try {
    const body = req.body;
    const payload = socialMediaSchema.parse(body); // Zod validation
    const user_id = req.user;

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) return handleTryResponseError(res, 400, "Unauthorized Access");

    // Check if the user's email is verified
    if (!user.emailVerified) {
      return handleTryResponseError(
        res,
        400,
        "Please verify your account to add social media links"
      );
    }

    // Check if the platform already exists for this user
    const existingPlatform = await prisma.socialMedia.findFirst({
      where: {
        user_id: user_id,
        platform: payload.platform,
      },
    });

    if (existingPlatform) {
      return handleTryResponseError(
        res,
        400,
        `The platform ${payload.platform} has already been added.`
      );
    }

    // Create the social media entry
    const newSocialMedia = await prisma.socialMedia.create({
      data: {
        ...payload,
        user_id: user.id,
      },
    });

    return handleTryResponseError(
      res,
      201,
      "Social media link added successfully",
      newSocialMedia
    );
  } catch (error) {
    return handleCatchError(error, res, "Error while adding social media link");
  }
});

headerHandler.post("/navigation", authMiddleware, async (req, res) => {
  try {
    const body = req.body;
    const payload = navigationSchema.parse(body); // Zod validation
    const user_id = req.user;

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) return handleTryResponseError(res, 400, "Unauthorized Access");

    // Check if the user's email is verified
    if (!user.emailVerified) {
      return handleTryResponseError(
        res,
        400,
        "Please verify your account to add navigation items"
      );
    }

    // Create the navigation item
    const newNavigation = await prisma.navigation.create({
      data: {
        ...payload,
        user_id: user_id,
      },
    });

    return handleTryResponseError(
      res,
      201,
      "Navigation item added successfully",
      newNavigation
    );
  } catch (error) {
    return handleCatchError(error, res, "Error while adding navigation item");
  }
});

export default headerHandler;
