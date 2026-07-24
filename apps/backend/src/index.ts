import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { env } from "@/config/env";
import v1Routes from "@/presentation/v1/routes";
import { errorMiddleware } from "@/presentation/v1/middlewares/error.middleware";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:8080",
      "https://app.sumly.nytrolabs.net",
      "https://app.dev.sumly.nytrolabs.net",
    ],
    credentials: true,
  }),
);
app.use("*", logger());

app.onError(errorMiddleware);

app.route("/api/v1", v1Routes);

export default {
  port: env.PORT,
  fetch: app.fetch,
};
