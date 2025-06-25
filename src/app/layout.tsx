import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "react-hot-toast";

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
        <Toaster position='bottom-center' reverseOrder={false} />
        {children}
      </body>
    </html>
  );
}
