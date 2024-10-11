import { Router } from "express";
import { sendMail } from "../config/mail.js";
import prisma from "../db/db.config.js";
import {
  handleCatchError,
  handleTryResponseError,
  renderEmailEjs,
} from "../helper.js";
import {
  loginSchemaValidation,
  registerSchemaValidation,
  reSendVerificationOTPSchema,
  verifyEmailSchema,
} from "../validations/auth.validation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";

const authHandler = Router();

// Register User
authHandler.post("/register", async (req, res) => {
  try {
    const body = req.body;
    const payload = registerSchemaValidation.parse(body);

    // Check Whether user already exist or not

    const user = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (user) {
      return handleTryResponseError(
        res,
        400,
        "User already exist with this email. Use another email to create an account"
      );
    }

    const genSalt = await bcrypt.genSalt(14);
    payload.password = await bcrypt.hash(payload.password, genSalt);

    // OTP EXPIRY
    const otpExpiryDuration = 10 * 60 * 1000; // 5 minutes in milliseconds
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        emailVerifyOtp: otp,
        emailVerifyOtpExpiry: new Date(Date.now() + otpExpiryDuration),
      },
    });

    //  Send Email
    const htmlEmailReponse = await renderEmailEjs("emailVerify", {
      name: payload.name,
      otp: otp,
    });
    await sendMail(payload.email, "Email Verification OTP", htmlEmailReponse);

    return handleTryResponseError(
      res,
      200,
      "Your account has been created an verification otp has been sent to your email. Check Your Inbox For otp verification."
    );
  } catch (error) {
    return handleCatchError(error, res, "Error while registering user");
  }
});

// verify email
authHandler.post("/verify-email", async (req, res) => {
  try {
    const body = req.body;
    const payload = verifyEmailSchema.parse(body);

    // check whether user exist or not

    const user = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!user) {
      return handleTryResponseError(
        res,
        400,
        "No user found with email. Please check your email"
      );
    }

    if (user.emailVerifyOtp !== payload.otp) {
      return handleTryResponseError(
        res,
        400,
        "Incorrect or expired OTP Please check your otp again"
      );
    }

    if (user.emailVerifyOtpExpiry === null) {
      return handleTryResponseError(res, 400, "Invalid OTP Expiry Request");
    }

    if (new Date() > user.emailVerifyOtpExpiry) {
      return handleTryResponseError(
        res,
        400,
        "Your otp has expired please request new otp"
      );
    }

    await prisma.user.update({
      where: {
        email: payload.email,
      },
      data: {
        emailVerifyOtp: null,
        emailVerified: true,
        emailVerifyOtpExpiry: null,
      },
    });

    const successHtml = await renderEmailEjs("accountVerified", {
      name: user.name,
    });

    await sendMail(
      payload.email,
      "Your Account Verified Successfully",
      successHtml
    );

    return handleTryResponseError(
      res,
      200,
      "Your email account verified successfully. You can now login"
    );
  } catch (error) {
    return handleCatchError(
      error,
      res,
      `Error while Verifying Email Using OTP ${error}`
    );
  }
});

// Re-send otp to user
authHandler.post("/resend-otp", async (req, res) => {
  try {
    const body = req.body;
    const payload = reSendVerificationOTPSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!user) {
      return handleTryResponseError(
        res,
        400,
        "User not found with this email."
      );
    }

    if (payload.email !== user.email) {
      return handleTryResponseError(
        res,
        400,
        "Invalid Email Please check your email"
      );
    }

    if (new Date() < user.emailVerifyOtpExpiry) {
      return handleTryResponseError(
        res,
        400,
        "Your Old OTP is still valid.Please use that one."
      );
    }

    const otpExpiryDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
    const newOtp = Math.floor(100000 + Math.random() * 900000);

    await prisma.user.update({
      where: {
        email: payload.email,
      },
      data: {
        emailVerifyOtp: newOtp,
        emailVerifyOtpExpiry: new Date(Date.now() + otpExpiryDuration),
      },
    });

    const emailHtml = await renderEmailEjs("emailVerify", {
      name: user.name,
      otp: newOtp,
    });

    await sendMail(payload.email, "Email Verification OTP", emailHtml);

    return handleTryResponseError(
      res,
      200,
      "New OTP sent. Please check your mailbox for the new OTP."
    );
  } catch (error) {
    return handleCatchError(error, res, "Failed to resend otp verification");
  }
});

// Login User
authHandler.post("/login", async (req, res) => {
  try {
    const body = req.body;
    const payload = loginSchemaValidation.parse(body);

    const user = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!user) {
      return handleTryResponseError(
        res,
        400,
        "User does not exist with this email. Please check your email."
      );
    }

    if (!user.emailVerified) {
      return handleTryResponseError(
        res,
        400,
        "Please verify your account to login"
      );
    }

    // check password

    const verifyPassword = await bcrypt.compare(
      payload.password,
      user.password
    );

    if (!verifyPassword) {
      return handleTryResponseError(res, 400, "Incorrect email or password");
    }

    const jwtPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      verifiedEmail: user.emailVerified,
    };

    const token = jwt.sign(jwtPayload, process.env.JWT_TOKEN, {
      expiresIn: "30d",
    });

    const responsePayload = {
      ...jwtPayload,
      token: `Bearer ${token}`,
    };

    console.log("Account Login Success");

    return handleTryResponseError(
      res,
      200,
      "Account login Success",
      responsePayload
    );
  } catch (error) {
    return handleCatchError(error, res, "Error while Login User");
  }
});

// Check Login User
authHandler.post("/check/credentials", async (req, res) => {
  try {
    const body = req.body;
    const payload = loginSchemaValidation.parse(body);

    const user = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!user) {
      return handleTryResponseError(
        res,
        400,
        "User does not exist with this email. Please check your email."
      );
    }

    if (!user.emailVerified) {
      return handleTryResponseError(
        res,
        400,
        "Please verify your account to login"
      );
    }

    // check password

    const verifyPassword = await bcrypt.compare(
      payload.password,
      user.password
    );

    if (!verifyPassword) {
      return handleTryResponseError(res, 400, "Incorrect email or password");
    }

    return handleTryResponseError(res, 200, "Account login Success");
  } catch (error) {
    return handleCatchError(error, res, "Error while Login User");
  }
});

// Get User Information
authHandler.get("/user", authMiddleware, async (req, res) => {
  try {
    const userCheck = req.user;

    const user = await prisma.user.findUnique({
      where: {
        email: userCheck.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        enableTwoFactorEmail: true,
        twoFactorEmail: true,
        isTwoFactorEmailVerified: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return handleTryResponseError(res, 400, "Unauthorized Access");
    }

    const payload = {
      ...user,
    };

    return handleTryResponseError(res, 200, "User Information", payload);
  } catch (error) {
    return handleCatchError(
      error,
      res,
      "Error while fetching user information"
    );
  }
});

// Profile Upload Route Here

authHandler.post(
  "/profile-upload",
  upload.single("profileImage"),
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
        return handleTryResponseError(res, 400, "Unauthorized Access");
      }

      if (!user.emailVerified) {
        return handleTryResponseError(
          res,
          400,
          "Please verify your account in order to upload profile image"
        );
      }

      const profileImageLocalPath = req.file.path;
      const profileImage = await uploadOnCloudinary(profileImageLocalPath);

      if (!profileImage) {
        return handleTryResponseError(
          res,
          400,
          "Error while uploading image to cloudinary"
        );
      }

      await prisma.user.update({
        where: {
          email: user.email,
        },
        data: {
          profileImage: profileImage.url,
        },
      });

      return handleTryResponseError(
        res,
        200,
        "Profile Image Uploaded Successfully"
      );
    } catch (error) {
      return handleCatchError(
        error,
        res,
        "Error while uploading Profile Image"
      );
    }
  }
);

export default authHandler;
