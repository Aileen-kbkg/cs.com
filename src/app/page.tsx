// app/page.tsx — Home page (front view). Replaces the create-next-app starter page.
import type { Metadata } from "next";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const page = await client.getSingle("home").catch(() => null);
  return {
    title: page?.data.meta_title ?? "Cost Segregation",
    description: page?.data.meta_description ?? "",
  };
}

export default async function HomePage() {
  const client = createClient();
  const page = await client.getSingle("home");

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black">
        <SliceZone slices={page.data.slices} components={components} />
      </main>
    </div>
  );
}