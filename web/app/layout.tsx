import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Space_Grotesk } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AppProviders } from "@/components/providers/app-provider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Poo Town",
  description: "Play Poo Town, the funniest Monopoly game in the world!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={spaceGrotesk.className}>
        <AppProviders>{children}</AppProviders>
        <Toaster />
        <Analytics mode="production" />;
      </body>
    </html>
  );
}
