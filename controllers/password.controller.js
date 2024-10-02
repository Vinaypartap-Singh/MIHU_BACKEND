import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  handleCatchError,
  handleTryResponseError,
  renderEmailEjs,
} from "../helper.js";
import {
  passwordChangeSchema,
  passwordResetRequestValidation,
  passwordResetVerificationValidation,
  passwordResetVerificationValidation2FA,
} from "../validations/auth.validation.js";
import prisma from "../db/db.config.js";
import { sendMail } from "../config/mail.js";
import bcrypt from "bcryptjs";

const passwordHandler = Router();

// Change Password If User Remember old password

passwordHandler.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user;
    const body = req.body;
    const payload = passwordChangeSchema.parse(body);
    const user = await prisma.user.findUnique({
      where: {
        email: user_id.email,
      },
    });

    if (!user) {
      return handleTryResponseError(res, 400, "Unauthorized Access");
    }

    if (!user.emailVerified) {
      return handleTryResponseError(
        res,
        400,
        "Please verify your account first"
      );
    }

    if (payload.password === payload.oldPassword) {
      return handleTryResponseError(
        res,
        400,
        "New password cannot be same as old password"
      );
    }

    const verifyOldPassword = await bcrypt.compare(
      payload.oldPassword,
      user.password
    );

    if (!verifyOldPassword) {
      return handleTryResponseError(
        res,
        400,
        "Old Password is not correct. Try Again"
      );
    }

    const salt = await bcrypt.genSalt(14);
    payload.password = await bcrypt.hash(payload.password, salt);

    await prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        password: payload.password,
      },
    });

    return handleTryResponseError(
      res,
      200,
      "Your password updated successfully. use your new password to login"
    );
  } catch (error) {
    return handleCatchError(
      error,
      res,
      "Unable to Change Password Using Your Old Password"
    );
  }
});

// Request Reset Password using primary email
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

// Reset Password using primary email
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

// Route to reset password using Two Factor Auth Email
passwordHandler.post(
  "/reset-request-password-2fa",
  authMiddleware,
  async (req, res) => {
    try {
      const user_id = req.user;
      const user = await prisma.user.findUnique({
        where: {
          email: user_id.email,
        },
      });

      if (!user) {
        return handleTryResponseError(res, 401, "Unauthorized Access");
      }

      if (!user.emailVerified) {
        return handleTryResponseError(
          res,
          401,
          "Please verify your primary email in order to reset password"
        );
      }

      if (!user.enableTwoFactorEmail) {
        return handleTryResponseError(
          res,
          401,
          "Two Factor authentication not enabled please enable and verify email in order to reset password using Two Factor Email"
        );
      }

      if (user.twoFactorEmail && !user.isTwoFactorEmailVerified) {
        return handleTryResponseError(
          res,
          401,
          "Your Two factor auth email is not verified. Please verify your two factor auth email"
        );
      }

      if (
        user.twoFactorEmail &&
        user.isTwoFactorEmailVerified &&
        user.forceTwoFactorDisable
      ) {
        return handleTryResponseError(
          res,
          401,
          "Your Two Factor Email Added and Verified but disabled by you. Please enable it to continue using two factor email"
        );
      }

      if (
        user.twoFactorEmail &&
        !user.isTwoFactorEmailVerified &&
        user.forceTwoFactorDisable
      ) {
        return handleTryResponseError(
          res,
          401,
          "Your Two Factor Email Added but not Verified and disabled by you. Please enable it to continue using two factor email"
        );
      }

      // OTP EXPIRY
      const otpExpiryDuration = 10 * 60 * 1000; // 5 minutes in milliseconds
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000);

      await prisma.user.update({
        where: {
          email: user.email,
        },
        data: {
          passwordResetOtp2FA: otp,
          passwordResetOtpExpiry2FA: new Date(Date.now() + otpExpiryDuration),
        },
      });

      const html = await renderEmailEjs("passwordResetOtpRequest", {
        name: user.name,
        otp: otp,
      });

      await sendMail(user.twoFactorEmail, "Reset Password", html);

      return handleTryResponseError(
        res,
        200,
        "Password Reset Otp Has been sent to your factor email. Please check your inbox"
      );
    } catch (error) {
      return handleCatchError(
        error,
        res,
        "Error Occured while resetting password using Factor Auth "
      );
    }
  }
);

// Verify 2FA Password and Reset

passwordHandler.post(
  "/reset-password-2fa",
  authMiddleware,
  async (req, res) => {
    try {
      const user_id = req.user;
      const body = req.body;
      const payload = passwordResetVerificationValidation2FA.parse(body);
      const user = await prisma.user.findUnique({
        where: {
          email: user_id.email,
        },
      });

      if (!user) {
        return handleTryResponseError(res, 401, "Unauthorized Access");
      }

      if (!user.emailVerified) {
        return handleTryResponseError(
          res,
          401,
          "Your Account is not verified. Please verify"
        );
      }

      if (!user.isTwoFactorEmailVerified) {
        return handleTryResponseError(
          res,
          401,
          "Your Two authentication email is not verified"
        );
      }

      if (user.forceTwoFactorDisable) {
        return handleTryResponseError(
          res,
          401,
          "You have disabled your two factor authentication email please enable and then use otp"
        );
      }

      if (new Date() > user.passwordResetOtpExpiry2FA) {
        return handleTryResponseError(
          res,
          401,
          "Your otp has expired please use new otp"
        );
      }

      if (payload.email !== user.twoFactorEmail) {
        return handleTryResponseError(
          res,
          401,
          "Please use correct email address given in two factor email"
        );
      }

      if (payload.otp !== user.passwordResetOtp2FA) {
        return handleTryResponseError(
          res,
          401,
          "Please use the correct otp. Check your inbox and type correct otp"
        );
      }

      const salt = await bcrypt.genSalt(14);
      payload.password = await bcrypt.hash(payload.password, salt);

      await prisma.user.update({
        where: {
          email: user.email,
          twoFactorEmail: payload.email,
        },
        data: {
          passwordResetOtp2FA: null,
          passwordResetOtpExpiry2FA: null,
          password: payload.password,
        },
      });

      const html = await renderEmailEjs("passwordResetSuccess", {
        name: user.name,
      });

      await sendMail(
        user.twoFactorEmail,
        `Your Primary Account Password Reset Success ${user.email}`,
        html
      );

      return handleTryResponseError(
        res,
        200,
        "Your password has changed successfully please continue login your account"
      );
    } catch (error) {
      return handleCatchError(
        error,
        res,
        "Error while resetting password using Two factor authentication"
      );
    }
  }
);

export default passwordHandler;
