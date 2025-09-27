import { z } from "zod";

const configSchema = z.object({
  NEXT_PUBLIC_PRIVY_APP_ID: z.string(),
  // PRIVY_APP_SECRET: z.string(),
  NEXT_PUBLIC_MAINNET_RPC_URL: z.string(),
  NEXT_PUBLIC_DEVNET_RPC_URL: z.string(),

  NEXT_PUBLIC_RPC_URL: z.string(),
  NEXT_PUBLIC_RPC_SUBSCRIPTIONS_URL: z.string(),

  NEXT_PUBLIC_AUTH_ID_PRIVY: z.string(),
  NEXT_PUBLIC_AUTH_PRIVATE_KEY_PRIVY: z.string(),
});

const configProject = configSchema.safeParse({
  NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  // PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET,
  NEXT_PUBLIC_MAINNET_RPC_URL: process.env.NEXT_PUBLIC_MAINNET_RPC_URL,
  NEXT_PUBLIC_DEVNET_RPC_URL: process.env.NEXT_PUBLIC_DEVNET_RPC_URL,

  NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
  NEXT_PUBLIC_RPC_SUBSCRIPTIONS_URL:
    process.env.NEXT_PUBLIC_RPC_SUBSCRIPTIONS_URL,

  NEXT_PUBLIC_AUTH_ID_PRIVY: process.env.NEXT_PUBLIC_AUTH_ID_PRIVY,
  NEXT_PUBLIC_AUTH_PRIVATE_KEY_PRIVY:
    process.env.NEXT_PUBLIC_AUTH_PRIVATE_KEY_PRIVY,
});

if (!configProject.success) {
  console.error(configProject.error.issues);
  throw new Error("Invalid environment variables");
}

const envConfig = configProject.data;

export default envConfig;
