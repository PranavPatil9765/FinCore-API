import express from "express";
import cors from "cors";
import morgan from "morgan";
import { limiter } from "./middleware/rateLimit.middleware.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import authRouter from "./modules/auth/auth.routes.js";
import userRouter from "./modules/user/user.routes.js";
import recordRouter from "./modules/record/record.routes.js";
import dashboardRouter from "./modules/dashboard/dashboard.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(limiter);

// Swagger Docs Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routers
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/records", recordRouter);
app.use("/api/dashboard", dashboardRouter);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "API running" });
});

// Error handler
app.use(errorHandler);

export default app;
