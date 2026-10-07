// app/layout.tsx
import { createClient } from "@/prismicio";
import Navbar from "@/components/Navbar";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const client = createClient();
  const settings = await client.getSingle("settings");

  return (
    <html lang="en">
      <body>
        <Navbar settings={settings} />
        {children}
      </body>
    </html>
  );
}