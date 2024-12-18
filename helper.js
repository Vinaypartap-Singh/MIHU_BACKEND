import path from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";
import { ZodError } from "zod";

// Get Directory

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Handle Zod Errors

export const formatError = (error) => {
  let errors = {};
  error.errors?.map((error) => {
    errors[error.path?.[0]] = error.message;
  });

  return errors;
};

export const renderEmailEjs = async (filename, payload) => {
  const html = await ejs.renderFile(
    __dirname + `/views/${filename}.ejs`,
    payload
  );
  return html;
};

// Try Catch Error Handler

export const handleCatchError = (error, res, errorMessage) => {
  if (error instanceof ZodError) {
    const formattedError = formatError(error);
    return res.status(400).json({
      message: errorMessage || "validation error",
      error: formattedError,
    });
  }

  return res.status(500).json({
    message: error.message || "An Error Occured",
    error: error.message || "Unknown Error",
  });
};

// Try Error and Response Handler

export const handleTryResponseError = (res, status, message, data) => {
  if (data) {
    return res.status(status || 200).json({
      message: message || "Common Try Response Error Handler",
      data: data,
    });
  }

  return res.status(status || 200).json({
    message: message || "Common Try Response Error Handler",
    data: {},
  });
};

export const verifyUserAndReturn = async (user_id) => {
  const user = await prisma.user.findUnique({
    where: {
      id: user_id,
    },
  });

  if (!user) {
    return handleTryResponseError(res, 400, "Please Log In Continue");
  }

  if (!user.emailVerified) {
    return handleTryResponseError(res, 400, "Please Verify Your Account");
  }
};

export const findUserUsingEmailAndReturn = async (email) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    return handleTryResponseError(
      res,
      400,
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
};
