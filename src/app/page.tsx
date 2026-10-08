// app/page.tsx — Home page. Fetches the Prismic "home" singleton and renders its slices.
import type { Metadata } from "next";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const page = await client.getSingle("home").catch(() => null);
  return {
    title: page?.data.meta_title ?? "Best Cost Segregation Software - Cost Segregation",
    description: page?.data.meta_description ?? "Maximize Your Tax Savings",
  };
}

export default async function HomePage() {
  const client = createClient();
  const page = await client.getSingle("home");

  return (
    <main>
      <SliceZone slices={page.data.slices} components={components} />
    </main>
  );
}