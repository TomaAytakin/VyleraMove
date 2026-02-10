import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VyleraMove",
  description: "Fleet Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 antialiased`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <Sidebar />

          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Header */}
            <Header />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-zinc-950">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
