import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import Script from "next/script";
import { ToastProvider } from "@/components/ui/Toast";
import { hasPublicPhone, siteConfig } from "@/config/site";
import { seoConfig } from "@/config/seo";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getRequestLocale } from "@/lib/i18n/server";
import "@/styles/globals.css";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["500", "600", "700"],
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

export function generateMetadata(): Metadata {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  const canonicalPath = localizedPath("/", locale);
  const canonicalUrl =
    canonicalPath === "/" ? seoConfig.siteUrl : `${seoConfig.siteUrl}${canonicalPath}`;
  const ogImageUrl = `${seoConfig.siteUrl}/og?locale=${locale}`;

  return {
    metadataBase: new URL(seoConfig.siteUrl),
    title: {
      default: dict.meta.title,
      template: `%s | ${seoConfig.siteName}`,
    },
    description: dict.meta.description,
    applicationName: seoConfig.siteName,
    keywords:
      locale === "en"
        ? [
            "jewelry Senegal",
            "jewelry Dakar",
            "perfume Dakar",
            "perfume Senegal",
            "women's watches Senegal",
            "gift sets Dakar",
            "incense Senegal",
            "luxury boutique Dakar",
            "Maison Danita",
            "Wave payment Senegal",
            "Orange Money",
          ]
        : [
            "bijoux Senegal",
            "bijoux Dakar",
            "parfums Dakar",
            "parfum Senegal",
            "montres femme Senegal",
            "coffrets cadeaux Dakar",
            "encens Senegal",
            "boutique luxe Dakar",
            "Maison Danita",
            "Wave paiement",
            "Orange Money",
          ],
    authors: [{ name: seoConfig.siteName, url: seoConfig.siteUrl }],
    creator: seoConfig.siteName,
    publisher: seoConfig.siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: dict.meta.locale,
      url: canonicalUrl,
      siteName: seoConfig.siteName,
      title: dict.meta.title,
      description: dict.meta.description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: seoConfig.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      creator: seoConfig.twitterHandle,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        fr: seoConfig.siteUrl,
        en: `${seoConfig.siteUrl}/en`,
        "x-default": seoConfig.siteUrl,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "",
    },
    icons: {
      icon: "/icon.svg",
      shortcut: "/icon.svg",
      apple: "/apple-touch-icon",
    },
    manifest: "/manifest.webmanifest",
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = getRequestLocale();
  const searchPath = localizedPath("/store/products", locale);
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    logo: `${seoConfig.siteUrl}/icon.svg`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: siteConfig.email,
      ...(hasPublicPhone ? { telephone: siteConfig.phone } : {}),
      availableLanguage: ["French", "English"],
    },
    sameAs: [],
  };
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    image: `${seoConfig.siteUrl}/og?locale=${locale}`,
    description: siteConfig.description,
    email: siteConfig.email,
    ...(hasPublicPhone ? { telephone: siteConfig.phone } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dakar",
      addressCountry: "SN",
    },
    areaServed: ["Dakar", "Senegal"],
    paymentAccepted: ["Wave", "Orange Money", "Cash on delivery"],
    currenciesAccepted: siteConfig.currency,
    priceRange: "5 000 XOF - 149 000 XOF",
  };

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(storeSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: seoConfig.siteName,
              url: seoConfig.siteUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${seoConfig.siteUrl}${searchPath}?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className={`${jost.variable} ${cormorantGaramond.variable}`}>
        <ToastProvider>
          {children}
        </ToastProvider>

        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}

        {META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
      </body>
    </html>
  );
}
