import { Router } from "express";
import authHandler from "../controllers/auth.controller.js";

const routeHandler = Router();

routeHandler.use("/api/auth", authHandler);

export default routeHandler;
