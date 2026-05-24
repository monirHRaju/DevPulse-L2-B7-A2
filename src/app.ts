import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import { requestLogger } from "./middleware/logger.js";
import {
  notFoundHandler,
  globalErrorHandler,
} from "./middleware/globalErrorHandler.js";
import authRoutes from "./api/routes/auth.routes.js";
import issueRoutes from "./api/routes/issue.routes.js";
import { pool } from "./database/index.js";

export const createApp = (): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.get("/api/health", async (_req: Request, res: Response) => {
    let database: "up" | "down" = "down";
    try {
      await pool.query("SELECT 1");
      database = "up";
    } catch (err) {
      console.error("Health check DB ping failed:", err);
    }

    const allUp = database === "up";
    res.status(allUp ? 200 : 503).json({
      success: allUp,
      message: allUp
        ? "DevPulse API is running"
        : "DevPulse API is up but the database is unreachable",
      data: {
        uptime: process.uptime(),
        database,
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/issues", issueRoutes);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
};
