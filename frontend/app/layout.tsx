import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "../src/components/auth/AuthProvider";
import { UserProvider } from "../src/components/auth/UserProvider";
import Navigation from "../src/components/layout/Navigation";
import Footer from "../src/components/layout/Footer";

export const metadata: Metadata = {
  title: "Investor Codex - Professional Investment Intelligence",
  description: "Enterprise-grade investment research and analysis platform with real-time data, comprehensive company profiles, and AI-powered insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-white text-gray-900 font-inter">
        <AuthProvider>
          <UserProvider>
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
