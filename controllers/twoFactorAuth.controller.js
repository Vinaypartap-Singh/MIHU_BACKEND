import { Router } from "express";
import {
  handleCatchError,
  handleTryResponseError,
  renderEmailEjs,
} from "../helper.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import prisma from "../db/db.config.js";
import {
  twoFAEmailSchema,
  twoFAToggleSchemaValidation,
} from "../validations/auth.validation.js";
import { sendMail } from "../config/mail.js";

const twoFAHandler = Router();

// Enable Disable Two Factor Authentication
twoFAHandler.post("/toggle", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;
    const body = req.body;
    const payload = twoFAToggleSchemaValidation.parse(body);

    const user = await prisma.user.findUnique({
      where: {
        id: user_id,
      },
    });

    if (!user) {
      return handleTryResponseError(res, 401, "Unauthorized Access");
    }

    if (!user.emailVerified) {
      return handleTryResponseError(
        res,
        401,
        "Please verify your email in order to two factor authentication"
      );
    }

    const new2FaStatus = payload.action === "enable" ? true : false;

    await prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        enableTwoFactorEmail: new2FaStatus,
      },
    });

    return handleTryResponseError(
      res,
      200,
      "Two Factor Authentication Updated"
    );
  } catch (error) {
    return handleCatchError(
      error,
      res,
      "Error while Enabling / Disabling Two Factor Authentication"
    );
  }
});

// Add Two Factor Authentication Email

twoFAHandler.post("/addEmail", authMiddleware, async (req, res) => {
  try {
    // Get two fa email from body
    const user_id = req.user.id;
    const body = req.body;
    const payload = twoFAEmailSchema.parse(body);
    const user = await prisma.user.finUnique({
      where: {
        id: user_id,
      },
    });

    if (!user) {
      return handleTryResponseError(res, 401, "Unauthorized Access");
    }

    if (!user.emailVerified) {
      return handleTryResponseError(
        res,
        401,
        "Please Verify Your Email In order Add Two Factor Email"
      );
    }

    if (!user.enableTwoFactorEmail) {
      return handleTryResponseError(
        res,
        401,
        "Please enable Two Factor Authentication in order to add two factor email"
      );
    }

    // OTP EXPIRY
    const otpExpiryDuration = 10 * 60 * 1000; // 5 minutes in milliseconds
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    //  Send Email
    const htmlEmailReponse = await renderEmailEjs("verifyTwoFA", {
      name: user.name,
      otp: otp,
    });

    await sendMail(payload.email, "Email Verification OTP", htmlEmailReponse);

    await prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        twoFactorEmail: payload.twoFAEmail,
        twoFactorEmailOTP: new Date(Date.now() + otpExpiryDuration),
      },
    });

    return handleTryResponseError(
      res,
      200,
      "Verification Email Sent on Your Two Factor Email"
    );
  } catch (error) {
    return handleCatchError(
      error,
      res,
      "Unable To Add Two Factor Email Please Check"
    );
  }
});

// Verify Two Factor Email

twoFAHandler.post("/verifyEmail", authMiddleware, async (req, res) => {});

export default twoFAHandler;
