import { Router } from "express";
import authHandler from "../controllers/auth.controller.js";
import passwordHandler from "../controllers/password.controller.js";
import twoFAHandler from "../controllers/twoFactorAuth.controller.js";

const routeHandler = Router();

routeHandler.use("/api/auth", authHandler);
routeHandler.use("/api/password", passwordHandler);
routeHandler.use("/api/twofa", twoFAHandler);

export default routeHandler;
