import { Router } from "express";
import authHandler from "../controllers/auth.controller.js";
import passwordHandler from "../controllers/password.controller.js";
import twoFAHandler from "../controllers/twoFactorAuth.controller.js";
import postHandler from "../controllers/post.controller.js";
import likeHandler from "../controllers/likes.controller.js";
import commentHandler from "../controllers/comment.controller.js";

const routeHandler = Router();

routeHandler.use("/api/auth", authHandler);
routeHandler.use("/api/password", passwordHandler);
routeHandler.use("/api/twofa", twoFAHandler);
routeHandler.use("/api/post", postHandler);
routeHandler.use("/api/like", likeHandler);
routeHandler.use("/api/comment", commentHandler);

export default routeHandler;
