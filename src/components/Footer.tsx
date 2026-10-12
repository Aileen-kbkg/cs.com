// src/components/Footer.tsx
// Server component. Fetches the logo from Prismic "site_settings" and the 3 latest blog posts.
// Accepts (and ignores) any props, so it works with the existing <Footer settings={...} /> call.
import { asText } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import Link from "next/link";
import { createClient } from "@/prismicio";

/* ---- Edit these to change the footer without touching the layout ---- */
const SUPPORT_EMAIL = "Support@costsegregation.com";
const INFO_EMAIL = "Info@costsegregation.com";
const KBKG_LOGO_SRC = "/kbkg-logo-white.svg"; // put the white KBKG logo in /public (leave "" to hide)
const SITE_LOGO_FALLBACK_SRC = "/costsegregation-logo-white.svg"; // used only if no Prismic logo is set

const SOCIAL: { name: string; href: string; path: string }[] = [
  { name: "Instagram", href: "#", path: "M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 4 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2ZM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.700 0 15.300 0 12 0Zm0 5.800a6.200 6.200 0 1 0 0 12.400A6.200 6.200 0 0 0 12 5.800Zm0 10.200a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.400-11.800a1.400 1.400 0 1 0 0 2.900 1.400 1.400 0 0 0 0-2.900Z" },
  { name: "Facebook", href: "#", path: "M24 12a12 12 0 1 0-13.900 11.900v-8.400H7.100V12h3V9.400c0-3 1.800-4.700 4.500-4.700 1.300 0 2.700.2 2.700.2v3h-1.500c-1.500 0-2 .9-2 1.900V12h3.400l-.5 3.500h-2.800v8.400A12 12 0 0 0 24 12Z" },
  { name: "LinkedIn", href: "#", path: "M20.400 20.500h-3.600v-5.600c0-1.300 0-3-1.800-3s-2.100 1.400-2.100 2.900v5.700H9.400V9h3.400v1.600c.5-.9 1.600-1.800 3.400-1.800 3.600 0 4.300 2.400 4.300 5.500v6.200ZM5.300 7.400a2.100 2.100 0 1 1 0-4.100 2.100 2.100 0 0 1 0 4.100Zm1.800 13.100H3.600V9h3.600v11.500ZM22.200 0H1.800C.8 0 0 .8 0 1.700v20.600c0 .9.800 1.700 1.800 1.700h20.400c1 0 1.800-.8 1.800-1.700V1.700C24 .8 23.200 0 22.200 0Z" },
  { name: "X", href: "#", path: "M18.200 2.300h3.300l-7.200 8.300L22.800 21.700h-6.700l-5.200-6.800-6 6.800H1.600l7.700-8.800L1.200 2.300H8l4.700 6.200 5.500-6.200Zm-1.200 17.500h1.800L7 4.100H5L17 19.800Z" },
  { name: "YouTube", href: "#", path: "M23.500 6.200a3 3 0 0 0-2.100-2.100C19.500 3.600 12 3.600 12 3.600s-7.500 0-9.400.5A3 3 0 0 0 .5 6.200C0 8.100 0 12 0 12s0 3.900.5 5.800a3 3 0 0 0 2.100 2.100c1.900.5 9.400.5 9.400.5s7.500 0 9.400-.5a3 3 0 0 0 2.100-2.100c.5-1.900.5-5.800.5-5.800s0-3.900-.5-5.800ZM9.600 15.600V8.400l6.200 3.600-6.200 3.600Z" },
  { name: "Email", href: `mailto:${INFO_EMAIL}`, path: "M0 5.200C0 4 1 3 2.200 3h19.600C23 3 24 4 24 5.200v.5l-12 7.400L0 5.700v-.5Zm0 3.100v10.500C0 20 1 21 2.200 21h19.600c1.200 0 2.200-1 2.200-2.200V8.300l-11.400 7a1.200 1.200 0 0 1-1.200 0L0 8.300Z" },
];

const FALLBACK_POSTS = [
  { title: "Case Study: Cost Segregation for a $1,200,000 Office Building", href: "/resources/cost-segregation-office-building/" },
  { title: "Cost Segregation vs. Bonus Depreciation: What\u2019s the Difference?", href: "/resources/cost-segregation-vs-bonus-depreciation/" },
  { title: "Cost Segregation for a Prior-Year Property: How to Catch Up with Form 3115", href: "/resources/cost-segregation-for-prior-year/" },
];

type Props = Record<string, unknown>;

export default async function Footer(_props: Props) {
  const client = createClient();
  const [settings, posts] = await Promise.all([
    client.getSingle("site_settings").catch(() => null),
    client.getAllByType("blog_post", { limit: 3, orderings: [{ field: "my.blog_post.date", direction: "desc" }] }).catch(() => []),
  ]);

  const recent = posts.length
    ? posts.map((p) => ({ title: asText(p.data.title), href: `/resources/${p.uid}/` }))
    : FALLBACK_POSTS;

  const logo = settings?.data?.logo;
  const year = new Date().getFullYear();

  const heading = "text-[1.65rem] font-bold leading-tight text-white";
  const link = "text-white transition hover:text-[#8fbcf5]";

  return (
    <footer className="bg-[#2a4073] text-white">
      <div className="mx-auto grid max-w-[1700px] gap-14 px-6 py-16 text-lg md:px-16 lg:grid-cols-[1fr_380px] lg:gap-24 xl:px-[150px] xl:text-xl">
        {/* ---------- Left column ---------- */}
        <div className="lg:pt-[50px]">
          <div className="flex items-center gap-8">
            {logo?.url ? (
              <PrismicNextImage field={logo} className="h-[96px] w-auto" alt="" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={SITE_LOGO_FALLBACK_SRC} alt="" className="h-[96px] w-auto" />
            )}
            {KBKG_LOGO_SRC && (
              <>
                <span className="h-[100px] w-px bg-white" aria-hidden />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={KBKG_LOGO_SRC} alt="KBKG" className="h-[96px] w-auto" />
              </>
            )}
          </div>

          <p className="mt-9 flex flex-wrap gap-x-7">
            <span>Residential Cost Segregator&reg;</span>
            <span>&copy; {year} all rights reserved</span>
          </p>

          <h2 className={heading + " mt-12"}>Contact Us</h2>
          <p className="mt-1 leading-[1.5]">
            For technical or product related questions contact{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold hover:text-[#8fbcf5]">{SUPPORT_EMAIL}</a>
            <br />
            For general inquiries contact{" "}
            <a href={`mailto:${INFO_EMAIL}`} className="font-bold hover:text-[#8fbcf5]">{INFO_EMAIL}</a>
          </p>

          <p className="mt-9">Please note, we currently provide support via email and do not offer phone support.</p>

          <p className="mt-7">
            <Link href="/affiliate-program/" className={link}>Affiliate Program</Link>
          </p>

          <ul className="mt-7 flex items-center gap-5" aria-label="Social media">
            {SOCIAL.map((s) => (
              <li key={s.name}>
                <a href={s.href} aria-label={s.name} target={s.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="block text-white transition hover:text-[#8fbcf5]">
                  <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden><path d={s.path} /></svg>
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-9">CostSegregation.com Now Includes Residential Cost Segregator&reg;</p>

          <p className="mt-7 text-[#277ce6]">
            <a href="https://privacy.cptn.co/privacy-policy/f7adcbbd-7982-4fab-92ad-efc8b1cb7ed8" target="_blank" rel="noopener noreferrer" className="hover:underline">Privacy Policy</a>
            <span className="text-white"> | </span>
            <a href="https://www.kbkg.com/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="hover:underline">Terms and Conditions</a>
          </p>
        </div>

        {/* ---------- Right column ---------- */}
        <div className="lg:pt-[10px]">
          <h2 className={heading}>Recent News</h2>
          <ul className="mt-9 space-y-9">
            {recent.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className={link + " block text-[1.05rem] leading-[1.6]"}>{p.title}</Link>
                <Link href={p.href} className="mt-0.5 inline-block text-sm font-bold text-[#277ce6] hover:underline">Read More &raquo;</Link>
              </li>
            ))}
          </ul>

          <h2 className={heading + " mt-9"}>Software</h2>
          <ul className="mt-7 space-y-6 text-[1.05rem]">
            <li><a href="https://www.kbkg.com/481a-calculator" target="_blank" rel="noopener noreferrer" className={link}>481(a)</a></li>
            <li><a href="https://www.kbkg.com/partial-disposition-calculator" target="_blank" rel="noopener noreferrer" className={link}>Partial Disposition Calculator</a></li>
          </ul>

          <h2 className={heading + " mt-12"}>Stay connected</h2>
          <p className="mt-7 text-[1.05rem]">
            <Link href="/stay-connected/" className={link}>Subscribe to SMS Notifications</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}