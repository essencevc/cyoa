import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { NavigationProgressProvider } from "@/components/navigation/navigation-progress-provider";
import { Analytics } from "@vercel/analytics/react";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  preload: true,
  display: "swap", // Use swap to prevent FOIT (Flash of Invisible Text)
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  preload: true,
  display: "swap", // Use swap to prevent FOIT
});

export const metadata: Metadata = {
  title: "CYOA",
  description:
    "Play through entire choose your own adventure stories, generated by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Add preload hints for critical resources */}
        <link
          rel="preconnect"
          href={process.env.TURSO_CONNECTION_URL || ""}
          crossOrigin="anonymous"
        />
        {/* Preconnect to S3 for faster image loading */}
        <link
          rel="preconnect"
          href="https://restate-story.s3.ap-southeast-1.amazonaws.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavigationProgressProvider>{children}</NavigationProgressProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
