import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investor Codex",
  description: "AI-powered investment research and analysis platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
