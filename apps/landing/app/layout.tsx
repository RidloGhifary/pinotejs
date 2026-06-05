import type { Metadata, Viewport } from "next";

import "./globals.css";

const siteUrl = "https://pinotejs.ridlolabs.net";
const title = "Pinote — Figma-style comments for any website";
const description =
  "Pinote is a lightweight JavaScript feedback layer for adding Figma-style comments directly on websites and web applications. Supports Vanilla JavaScript, React, and Next.js.";
const ogImage = "/og-image.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Pinote",
  authors: [{ name: "Ridlo Ghifary", url: "https://github.com/RidloGhifary" }],
  creator: "Ridlo Ghifary",
  publisher: "Ridlo Ghifary",
  keywords: [
    "Pinote",
    "pinotejs",
    "JavaScript feedback tool",
    "UI comments",
    "Figma-style comments",
    "website annotation",
    "visual feedback",
    "React comments",
    "Next.js comments",
    "QA feedback",
    "client feedback",
    "design review tool",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "Pinote",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Pinote Figma-style comments for websites",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/pinote-logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "64x64" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#02040a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang="en">
      <body>
        <div className="noise" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
