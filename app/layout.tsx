import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="dark">
      <body className="antialiased bg-black selection:bg-fanx-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
