import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "SmokeScreen",
  description: "Personal air and fire awareness dashboard"
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
