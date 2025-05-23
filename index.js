import cors from "cors";
import "dotenv/config";
import express from "express";
import http from "http";
import path from "path";
import swaggerUI from "swagger-ui-express";
import { fileURLToPath } from "url";
import routeHandler from "./routes/index.js";
import { swaggerDocs } from "./swagger.js";

// Setup
const app = express();
const PORT = process.env.PORT || 7000;

// Swagger Config and Init

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// server

const server = http.createServer(app);

// Set keep-alive timeout to 30 seconds (30000 ms)
server.keepAliveTimeout = 30000; // 30 seconds

// Optional: Increase the headers timeout if needed
server.headersTimeout = 40000; // 40 seconds

// Express CORS and URl Encoded
app.use(
  cors({
    origin: [
      "https://mihu-builder.netlify.app",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// View Engine
app.set("view engine", "ejs");
// EJS Path
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.set("views", path.resolve(__dirname, "./views"));

// Handle Routes
app.use(routeHandler);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Server status check
 *     description: Returns a message if server is running
 *     tags: [Server Check]
 *     responses:
 *       200:
 *         description: Server is Running
 *         content:
 *           application/json:
 *             example:
 *               message: Server is running
 */

app.get("/", async (req, res) => {
  return res.json({ message: "Server is running" });
});

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
