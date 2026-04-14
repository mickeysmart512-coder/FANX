import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/ThemeProvider";
import Preloader from "@/components/Preloader";

export const metadata: Metadata = {
  title: "FANX | Where Fans & Stars Collide",
  description: "TikTok Live × Zoom hybrid for the ultimate celebrity experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Preloader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
