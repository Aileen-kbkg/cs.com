import { PrismicPreview } from "@prismicio/next";
import { repositoryName, createClient } from "@/prismicio";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import HeaderSlot from "@/components/HeaderSlot";
import "./styles/styles.css";


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
        {/* Partner landing pages render their own header, so HeaderSlot
            drops the standard Navbar on those routes. */}
        <HeaderSlot>
          <Navbar settings={settings} />
        </HeaderSlot>

        {children}

        <Footer />

        <PrismicPreview repositoryName={repositoryName} />
      </body>
    </html>
  );
}