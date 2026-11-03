import { PrismicPreview } from "@prismicio/next";
import { repositoryName, createClient } from "@/prismicio";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import HeaderSlot from "@/components/HeaderSlot";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./styles/styles.css";

/** Google Tag Manager container from the live site; it loads GA4, ads, consent and affiliate tags. */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-TPBQJ7ZR";

/** GoHighLevel web chat widget from the live site. */
const GHL_WIDGET_ID = "69aedc6c03fc833173e9a6f9";

/** Sitewide Organization and WebSite schema, as the live site publishes. */
const structuredData = (logo: string | null | undefined) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      ...(logo ? { logo } : {}),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-US",
    },
  ],
});


const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Best Cost Segregation Software - Cost Segregation",
  description: "Maximize Your Tax Savings",
  openGraph: {
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
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
        {/* Google Tag Manager (noscript), as on the live site. */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData(settings?.data.logo?.url)),
          }}
        />

        {/* Partner landing pages render their own header, so HeaderSlot
            drops the standard Navbar on those routes. */}
        <HeaderSlot>
          <Navbar settings={settings} />
        </HeaderSlot>

        {children}

        <Footer />

        <PrismicPreview repositoryName={repositoryName} />

        {/* HubSpot tracking (portal 3615782), as on the live site. It also
            powers the newsletter pop-up the announcement bar opens. */}
        <Script
          id="hs-script-loader"
          src="https://js.hs-scripts.com/3615782.js"
          strategy="afterInteractive"
        />

        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>

        {/* GoHighLevel web chat; opens itself after 10s on desktop, as on the live site. */}
        <Script
          id="ghl-chat"
          src="https://widgets.leadconnectorhq.com/loader.js"
          data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
          data-widget-id={GHL_WIDGET_ID}
          strategy="afterInteractive"
        />
        <Script id="ghl-chat-open" strategy="afterInteractive">
          {`setTimeout(function(){var w=window.leadConnector;if(!window.matchMedia("(max-width: 767px)").matches&&w&&w.chatWidget){w.chatWidget.openWidget();}},10000);`}
        </Script>

        {/* KBKG URL Passthrough (ported from the WordPress plugin): copies the
            landing page's query parameters (UTM, affiliate…) onto links to
            app.costsegregation.com when they are clicked, without overriding
            parameters a link already has. */}
        <Script id="kbkg-url-passthrough" strategy="afterInteractive">
          {`(function(){var params=window.location.search.substring(1);if(!params)return;document.addEventListener('click',function(e){var link=e.target.closest&&e.target.closest('a');if(!link)return;var href=link.getAttribute('href');if(!href)return;try{var url=new URL(href,window.location.origin);if(url.hostname!=='app.costsegregation.com')return;new URLSearchParams(params).forEach(function(value,key){if(!url.searchParams.has(key))url.searchParams.set(key,value);});link.setAttribute('href',url.toString());}catch(ex){}},true);})();`}
        </Script>
      </body>
    </html>
  );
}