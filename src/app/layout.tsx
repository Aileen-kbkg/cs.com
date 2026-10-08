
// app/layout.tsx — Root layout: fetches site settings and renders Navbar + Footer on every page.
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/prismicio";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Best Cost Segregation Software - Cost Segregation",
  description: "Maximize Your Tax Savings",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = createClient();

  const settings = await client
    .getSingle("site_settings")
    .catch(() => null);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar settings={settings} />
        {children}
        <Footer settings={settings} />
      </body>
    </html>
  );
}

