import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import { requestLogger } from "./middleware/logger.js";
import {
  notFoundHandler,
  globalErrorHandler,
} from "./middleware/globalErrorHandler.js";
import authRoutes from "./api/routes/auth.routes.js";
import issueRoutes from "./api/routes/issue.routes.js";

export const createApp = (): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "DevPulse API is running",
      data: { uptime: process.uptime() },
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/issues", issueRoutes);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
};
