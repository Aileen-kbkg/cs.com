"use client";

import { useEffect, useState } from "react";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

export default function HomePageClient() {
  const [page, setPage] = useState<any>(null);

  useEffect(() => {
    async function loadHomePage() {
      const client = createClient();
      const data = await client.getSingle("home");
      setPage(data);
    }

    loadHomePage();
  }, []);

  if (!page) {
    return null;
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black">
        <SliceZone slices={page.data.slices} components={components} />
      </main>
    </div>
  );
}