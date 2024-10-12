import express from "express";
import "dotenv/config";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";
import routeHandler from "./routes/index.js";

// Setup
const app = express();
const PORT = process.env.PORT || 7000;

// Express CORS and URl Encoded
app.use(cors({ origin: "https://mihu-builder.netlify.app" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// View Engine
app.set("view engine", "ejs");
// EJS Path
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.set("views", path.resolve(__dirname, "./views"));

// Handle Routes
app.use(routeHandler);

app.get("/", async (req, res) => {
  return res.json({ message: "Server is running" });
});

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
