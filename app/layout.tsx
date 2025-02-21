import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coin Guardian",
  description: "Protect your bitcoin with a watchtower",
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
