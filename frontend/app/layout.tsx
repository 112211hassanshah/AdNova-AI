import type { Metadata } from "next";
import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adwise · Advertising Budget Optimizer",
  description:
    "An independent workspace for advertising analytics and advisory budget planning.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
