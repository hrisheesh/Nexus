import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers";
import { Sidebar } from "@/components/sidebar";
import { SettingsProvider } from "@/components/settings-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NexusRAG",
  description: "Intelligent RAG-powered chatbot with advanced retrieval",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <SettingsProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-hidden">
                {children}
              </main>
            </div>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
