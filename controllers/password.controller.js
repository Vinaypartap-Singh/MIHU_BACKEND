import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  handleCatchError,
  handleTryResponseError,
  renderEmailEjs,
} from "../helper.js";
import {
  passwordResetRequestValidation,
  passwordResetVerificationValidation,
} from "../validations/auth.validation.js";
import prisma from "../db/db.config.js";
import { sendMail } from "../config/mail.js";
import bcrypt from "bcryptjs";

const passwordHandler = Router();

passwordHandler.post(
  "/request-reset-password",
  authMiddleware,
  async (req, res) => {
    try {
      const body = req.body;
      const payload = passwordResetRequestValidation.parse(body);

      const user = await prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (!user) {
        return handleTryResponseError(
          res,
          401,
          "Unauthorized Access. User not Found"
        );
      }

      if (!user.emailVerified) {
        return handleTryResponseError(
          res,
          400,
          "Please verify your account to login"
        );
      }

      const otpExpiryDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
      const passwordResetOtp = Math.floor(100000 + Math.random() * 900000);

      await prisma.user.update({
        where: {
          email: user.email,
        },
        data: {
          passwordResetOtp: passwordResetOtp,
          passwordResetOtpExpiry: new Date(Date.now() + otpExpiryDuration),
        },
      });

      const passwordResetOtpEmail = await renderEmailEjs(
        "passwordResetOtpRequest",
        {
          name: user.name,
          otp: passwordResetOtp,
        }
      );

      await sendMail(user.email, "Password Reset OTP", passwordResetOtpEmail);

      return handleTryResponseError(
        res,
        200,
        "Password Reset OTP sent please check your mailbox"
      );
    } catch (error) {
      return handleCatchError(
        error,
        res,
        "Error while password reset request."
      );
    }
  }
);

passwordHandler.post("/reset-password", authMiddleware, async (req, res) => {
  try {
    const body = req.body;
    const payload = passwordResetVerificationValidation.parse(body);

    const user = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!user) {
      return handleTryResponseError(
        res,
        401,
        "Unauthorized Access. User not Found"
      );
    }

    if (!user.emailVerified) {
      return handleTryResponseError(
        res,
        400,
        "Please verify your account to login"
      );
    }

    if (payload.otp !== user.passwordResetOtp) {
      return handleTryResponseError(res, 400, "Invalid OTP CHECK AGAIN");
    }

    if (new Date() > user.passwordResetOtpExpiry) {
      return handleTryResponseError(
        res,
        401,
        "Otp expired please request new otp to reset password"
      );
    }

    // Hash Password
    const salt = await bcrypt.genSalt(14);
    payload.password = await bcrypt.hash(payload.password, salt);

    await prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        password: payload.password,
        passwordResetOtp: null,
        passwordResetOtpExpiry: null,
      },
    });

    const passwordResetSuccessHtml = await renderEmailEjs(
      "passwordResetSuccess",
      {
        name: user.name,
      }
    );

    await sendMail(
      user.email,
      "Password Changed Successfully",
      passwordResetSuccessHtml
    );

    return handleTryResponseError(
      res,
      200,
      "Your password changed successfully."
    );
  } catch (error) {
    return handleCatchError(error, res, "Error while resetting password");
  }
});

export default passwordHandler;
