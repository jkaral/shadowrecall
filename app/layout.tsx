import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShadowRecall — Memory Influence Firewall",
  description: "See when AI memory silently changes an agent's planned action.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
