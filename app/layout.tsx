import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simple To-do List",
  description: "A clean local task list for tracking what is left today.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
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
