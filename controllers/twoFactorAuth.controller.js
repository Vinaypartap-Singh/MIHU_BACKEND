import { Router } from "express";
import {
  findUserUsingEmailAndReturn,
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

    const user = findUserUsingEmailAndReturn(user_id.email);

    if (user.twoFactorEmail && user.isTwoFactorEmailVerified) {
      return handleTryResponseError(
        res,
        401,
        "An email already added to your account and verified."
      );
    }

    if (user.twoFactorEmail && !user.isTwoFactorEmailVerified) {
      return handleTryResponseError(
        res,
        401,
        "An email already added to your account and not verified."
      );
    }

    if (payload.forceDisable !== true) {
      return handleTryResponseError(
        res,
        401,
        "Expected Disable Value to disable 2fa email"
      );
    }

    if (payload.forceDisable) {
      if (user.twoFactorEmail && user.isTwoFactorEmailVerified) {
        await prisma.user.update({
          where: {
            email: user_id.email,
          },
          data: {
            enableTwoFactorEmail: false,
            forceTwoFactorDisable: true,
          },
        });
        return handleTryResponseError(
          res,
          200,
          "Your verified email for two factor authentication disabled and will not be used for resetting password and account recovery."
        );
      } else if (user.twoFactorEmail && !user.isTwoFactorEmailVerified) {
        await prisma.user.update({
          where: {
            email: user_id.email,
          },
          data: {
            enableTwoFactorEmail: false,
            forceTwoFactorDisable: true,
          },
        });

        return handleTryResponseError(
          res,
          200,
          "Your unverified two factor email has been disabled. Verify your email when you enable two factor auth"
        );
      }
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

    //  user_id.email

    const user = await findUserUsingEmailAndReturn(user_id.email);

    if (!user.enableTwoFactorEmail) {
      return handleTryResponseError(
        res,
        401,
        "Enable Two-Factor Authentication before adding a Two-Factor email."
      );
    }

    // check whether this email used by another one or not

    const check_user_2fa_email_exist = await prisma.user.findUnique({
      where: {
        twoFactorEmail: payload.twoFAEmail,
      },
    });

    if (check_user_2fa_email_exist) {
      return handleTryResponseError(
        res,
        401,
        "This email is already by someone else please use another email."
      );
    }

    if (user.twoFactorEmail !== null && user.isTwoFactorEmailVerified) {
      return handleTryResponseError(
        res,
        401,
        "Two Factor Authentication Email Already Exist and Verified. Please use that one"
      );
    }

    if (user.twoFactorEmail !== null && !user.isTwoFactorEmailVerified) {
      return handleTryResponseError(
        res,
        401,
        "Two Factor Authentication Email Already Exist and not Verified.Please verify your existing email"
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

    const user = await findUserUsingEmailAndReturn(user_id.email);

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
