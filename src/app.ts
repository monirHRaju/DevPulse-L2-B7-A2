import express, { type Application, type Request, type Response } from "express";

export const createApp = (): Application => {
  const app = express();

  app.use(express.json());

  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "DevPulse API is running",
      data: { uptime: process.uptime() },
    });
  });

  return app;
};
