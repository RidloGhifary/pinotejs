import { LandingPage } from "@/components/landing/landing-page";

const siteUrl = "https://pinotejs.ridlolabs.net";
const description =
  "Pinote is a lightweight JavaScript feedback layer for adding Figma-style comments directly on websites and web applications. Supports Vanilla JavaScript, React, and Next.js.";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Pinote",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  description,
  url: siteUrl,
  image: `${siteUrl}/og-image.png`,
  softwareVersion: "0.1.1",
  license: "https://opensource.org/license/mit",
  codeRepository: "https://github.com/RidloGhifary/pinote",
  sameAs: [
    "https://github.com/RidloGhifary/pinote",
    "https://www.npmjs.com/package/pinotejs",
  ],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LandingPage />
    </>
  );
}
