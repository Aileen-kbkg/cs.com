import { PrismicPreview } from "@prismicio/next";
import { repositoryName, createClient } from "@/prismicio";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer/Footer";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Best Cost Segregation Software - Cost Segregation",
  description: "Maximize Your Tax Savings",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = createClient();

  const settings = await client
    .getSingle("site_settings")
    .catch(() => null);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar settings={settings} />

        {children}

        <Footer />

        <PrismicPreview repositoryName={repositoryName} />
      </body>
    </html>
  );
}