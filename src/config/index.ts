import dotenv from "dotenv";
import path from "path";

export enum AppEnvironment {
  PRODUCTION = "production",
  DEVELOPMENT = "development",
  TEST = "test",
}

const envFile = path.resolve(
  process.cwd(),
  `.env`
);

dotenv.config({ path: envFile });

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is missing!`);
  }
  return value;
};

const config = {
  app: {
    port: Number(getEnv("PORT", "3000")),
    env: (getEnv("NODE_ENV", "development") as AppEnvironment),
    brandName: "MetricmindConcept",
    corsOrigins: getEnv("CORS_ORIGIN", "http://localhost:3000,https://metricmindconcept.com")
      .split(",")
      .map((o) => o.trim()),
  },
  frontend: {
    baseUrl: getEnv("FRONTEND_URL", "https://metricmindconcept.com"),
  },
  db: {
    uri: getEnv("DATABASE_URL"),
  },
  jwt: {
    secret: getEnv("JWT_SECRET"),
    secretAdmin: getEnv("JWT_SECRET_ADMIN"),
    expiresIn: getEnv("JWT_EXPIRES_IN", "15m"),
    rememberExpiresIn: getEnv("JWT_REMEMBER_EXPIRES_IN", "90d"),
    refreshTokenExpiresIn: getEnv("JWT_REFRESH_EXPIRES_IN", "90d"),
  },
  paystack: {
    secretKey: getEnv("PAYSTACK_SECRET_KEY"),
    publicKey: getEnv("PAYSTACK_PUBLIC_KEY"),
    baseUrl: getEnv("PAYSTACK_BASE_URL", "https://api.paystack.co"),
    webhookUrl: getEnv("PAYSTACK_WEBHOOK_URL", "/api/v1/wallet/webhook/paystack"),
  },
  mail: {
    from: getEnv("EMAILFROM", "support@metricmindconcept.com"),
    supportEmail: getEnv("SUPPORT_EMAIL", "support@metricmindconcept.com"),
    // Development: Gmail SMTP
    gmailUser: getEnv("GMAIL_USER", ""),
    gmailPass: getEnv("GMAIL_PASSWORD", ""),
  }
};

export default config;
