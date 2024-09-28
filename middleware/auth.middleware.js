import { handleTryResponseError } from "../helper.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader === null || authHeader === undefined) {
    return handleTryResponseError(res, 400, "Unathorized Access");
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_TOKEN, (err, user) => {
    if (err) {
      return handleTryResponseError(res, 401, "Unauthorized Access");
    }
    req.user = user;
    next();
  });
};
