import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@/db";
import { sendWelcomeEmail } from "@/infrastructure/email/send-welcome-email";

export const auth = betterAuth({
  basePath: "/api/v1/auth",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    "http://localhost:5173",
    "http://localhost:8080",
    "https://app.sumly.nytrolabs.net",
    "https://dev.app.sumly.nytrolabs.net",
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await sendWelcomeEmail(user.email, user.name);
        },
      },
    },
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for"],
    },
  },
});
