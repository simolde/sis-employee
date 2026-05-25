import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Starland Employee Attendance System",
  description:
    "Modern attendance and HR system for Starland International School, Inc.",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}