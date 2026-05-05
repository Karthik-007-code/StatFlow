import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import errorHandler from "./middleware/errorHandler.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });


const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);




const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 StatFlow API running on http://localhost:${PORT}`);

  });
};

startServer();
