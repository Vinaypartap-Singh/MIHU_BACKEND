import { Router } from "express";
import { upload } from "../middleware/multer.middleware";
import { handleCatchError, handleTryResponseError } from "../helper";
import { authMiddleware } from "../middleware/auth.middleware";
import prisma from "../db/db.config";
import { uploadOnCloudinary } from "../config/cloudinary";
import { headerSchema } from "../validations/header.validation";

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
