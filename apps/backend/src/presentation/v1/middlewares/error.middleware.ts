import type { Context, Next } from "hono";

import { AppError } from "@/shared/errors";
import type { ZodError } from "zod";

export async function errorMiddleware(err: Error, c: Context) {
  if (err instanceof AppError) {
    return c.json(
      {
        error: {
          code: err.code,
          message: err.message,
        },
      },
      err.statusCode as 400 | 401 | 404 | 409 | 500
    );
  }

  if ((err as ZodError).name === "ZodError") {
    const zodError = err as ZodError;
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: zodError.errors,
        },
      },
      400
    );
  }

  console.error("Unhandled error:", err);

  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    },
    500
  );
}
