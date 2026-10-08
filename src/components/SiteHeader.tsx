"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/prismicio";
import Navbar from "@/components/Navbar";

export default function SiteHeader() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function loadSettings() {
      const client = createClient();
      const data = await client.getSingle("site_settings");
      setSettings(data);
    }

    loadSettings();
  }, []);

  if (!settings) {
    return null;
  }

  return <Navbar settings={settings} />;
}