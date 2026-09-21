import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "Inside: Your Personal AI Data Analyst",
  description:
    "Inside connects to your warehouses, CRMs, and spreadsheets, turning plain-English questions into publication-ready charts, deep root-cause summaries, and proactive business decisions.",
  keywords: [
    "AI Data Analyst",
    "Conversational BI",
    "SQL Generator",
    "Autonomous Analytics",
    "Snowflake AI",
    "Data Intelligence",
  ],
  authors: [{ name: "Inside Team" }],
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased min-h-screen selection:bg-orange-500 selection:text-white">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
