import { LandingPage } from "@/components/landing/landing-page";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Pinote",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  description:
    "A lightweight JavaScript feedback layer for adding comments directly on websites and web applications.",
  url: "https://pinotejs.ridlolabs.net",
  softwareVersion: "0.1.1",
  license: "https://opensource.org/license/mit",
  codeRepository: "https://github.com/RidloGhifary/pinote",
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
