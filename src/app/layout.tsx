import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmokeScreen",
  description: "Track wildfires & stubble burning in real-time, along with its impact on air quality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
