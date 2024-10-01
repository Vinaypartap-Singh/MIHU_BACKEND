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
  twoFAVerifySchema,
} from "../validations/auth.validation.js";
import { sendMail } from "../config/mail.js";

const twoFAHandler = Router();

// Enable/Disable Two-Factor Authentication
twoFAHandler.post("/toggle", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user;
    const body = req.body;
    const payload = twoFAToggleSchemaValidation.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: user_id.email },
    });

    if (!user) {
      return handleTryResponseError(res, 401, "Unauthorized Access");
    }

    if (!user.emailVerified) {
      return handleTryResponseError(
        res,
        401,
        "Please verify your email to enable two-factor authentication."
      );
    }

    const new2FaStatus = payload.action === "enable" ? true : false;

    if (user.enableTwoFactorEmail === new2FaStatus) {
      return handleTryResponseError(
        res,
        401,
        "Two Factor Authentication Already Enabled/Disabled"
      );
    }

    await prisma.user.update({
      where: { email: user.email },
      data: { enableTwoFactorEmail: new2FaStatus },
    });

    return handleTryResponseError(
      res,
      200,
      "Two-Factor Authentication Updated Successfully."
    );
  } catch (error) {
    return handleCatchError(
      error,
      res,
      "Error while enabling/disabling Two-Factor Authentication."
    );
  }
});

// Add Two-Factor Authentication Email
twoFAHandler.post("/addEmail", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user;
    const body = req.body;
    const payload = twoFAEmailSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: user_id.email },
    });

    if (!user) {
      return handleTryResponseError(res, 401, "Unauthorized Access");
    }

    if (!user.emailVerified) {
      return handleTryResponseError(
        res,
        401,
        "Please verify your email to add a Two-Factor Authentication email."
      );
    }

    if (!user.enableTwoFactorEmail) {
      return handleTryResponseError(
        res,
        401,
        "Enable Two-Factor Authentication before adding a Two-Factor email."
      );
    }

    if (user.twoFactorEmail !== null) {
      return handleTryResponseError(
        res,
        401,
        "Two Factor Authentication Email Already Exist. Please use that one"
      );
    }

    if (user.email === payload.twoFAEmail) {
      return handleTryResponseError(
        res,
        401,
        "Primary Email Cannot be added as Two Factor Email"
      );
    }

    // OTP expiry set to 10 minutes
    const otpExpiryDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Send Email
    const htmlEmailResponse = await renderEmailEjs("verifyTwoFA", {
      name: user.name,
      otp,
    });

    await sendMail(
      payload.twoFAEmail,
      "Email Verification OTP",
      htmlEmailResponse
    );

    await prisma.user.update({
      where: { email: user_id.email },
      data: {
        twoFactorEmail: payload.twoFAEmail,
        twoFactorEmailOTP: otp,
        twoFactorEmailOTPExpiry: new Date(Date.now() + otpExpiryDuration),
      },
    });

    return handleTryResponseError(
      res,
      200,
      "Verification email sent to your Two-Factor email."
    );
  } catch (error) {
    return handleCatchError(
      error,
      res,
      "Unable to add Two-Factor email. Please check your details."
    );
  }
});

// Verify Two-Factor Authentication Email
twoFAHandler.post("/verify-email", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user;
    const body = req.body;
    const payload = twoFAVerifySchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: user_id.email },
    });

    if (!user) {
      return handleTryResponseError(res, 401, "Unauthorized Access");
    }

    if (!user.emailVerified) {
      return handleTryResponseError(
        res,
        401,
        "Please verify your email before adding a Two-Factor email."
      );
    }

    if (!user.enableTwoFactorEmail) {
      return handleTryResponseError(
        res,
        401,
        "Enable Two-Factor Authentication before verifying the Two-Factor email."
      );
    }

    if (payload.twoFAEmail !== user.twoFactorEmail) {
      return handleTryResponseError(
        res,
        401,
        "Invalid email. Please check your details."
      );
    }

    if (user.twoFactorEmailOTP !== payload.otp) {
      return handleTryResponseError(res, 401, "Invalid OTP.");
    }

    if (new Date() > user.twoFactorEmailOTPExpiry) {
      return handleTryResponseError(
        res,
        401,
        "OTP has expired. Please request a new one."
      );
    }

    await prisma.user.update({
      where: { email: user_id.email },
      data: {
        twoFactorEmailOTP: null,
        twoFactorEmailOTPExpiry: null,
        isTwoFactorEmailVerified: true,
      },
    });

    const emailverifiedHtml = await renderEmailEjs("twoFAEmailVerified", {
      name: user.name,
    });

    await sendMail(
      payload.twoFAEmail,
      "Two Factor Email Verified",
      emailverifiedHtml
    );

    return handleTryResponseError(
      res,
      200,
      "Your Two-Factor Authentication email has been verified."
    );
  } catch (error) {
    return handleCatchError(
      error,
      res,
      "Error while verifying Two-Factor Authentication email."
    );
  }
});

export default twoFAHandler;
