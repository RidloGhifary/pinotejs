import type { Metadata } from "next";

import "./globals.css";

const description =
  "A lightweight JavaScript feedback layer for adding comments directly on websites and web applications.";

export const metadata: Metadata = {
  metadataBase: new URL("https://pinotejs.ridlolabs.net"),
  title: "Pinote — Figma-style feedback for any website",
  description,
  applicationName: "Pinote",
  authors: [{ name: "Ridlo Ghifary", url: "https://github.com/RidloGhifary" }],
  keywords: [
    "Pinote",
    "pinotejs",
    "website feedback",
    "Figma comments",
    "JavaScript comments",
    "React feedback",
    "UI annotations",
  ],
  openGraph: {
    title: "Pinote — Figma-style feedback for any website",
    description,
    url: "https://pinotejs.ridlolabs.net",
    siteName: "Pinote",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pinote — Figma-style feedback for any website",
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
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
