import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "photog",
  description: "A personal photo blog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
