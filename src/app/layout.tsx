import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { RegisterServiceWorker } from "./register-sw";
import { StructuredData } from "./structured-data";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = "https://kolory.app"; // Update this to your actual domain
const title = "Kolory - Color Palette Generator";
const description = "Generate beautiful color palettes with harmony modes, lock colors, random fonts, and export in multiple formats. A modern color tool for designers and developers by Iggy Love.";
const author = "Iggy Love";
const authorUrl = "https://iggy.love";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | Kolory",
  },
  description,
  keywords: [
    "color palette",
    "color generator",
    "color harmony",
    "color picker",
    "design tools",
    "color scheme",
    "palette generator",
    "hex colors",
    "rgb colors",
    "hsl colors",
    "complementary colors",
    "analogous colors",
    "triadic colors",
    "monochromatic colors",
    "design",
    "web design",
    "graphic design",
  ],
  authors: [{ name: author, url: authorUrl }],
  creator: author,
  publisher: author,
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kolory",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title,
    description,
    siteName: "Kolory",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Kolory - Color Palette Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/icon.png"],
    creator: "@iggylove", // Update if different
  },
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
  icons: {
    icon: [
      { url: "/icon.png", sizes: "any" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icon.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-hidden">
      <head>
        <link rel="icon" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta name="application-name" content="Kolory" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Kolory" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`${dmSans.variable} antialiased overflow-hidden`}
      >
        <StructuredData />
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
