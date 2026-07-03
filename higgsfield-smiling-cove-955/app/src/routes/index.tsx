import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "../components/bwc/nav";
import { Hero } from "../components/bwc/hero";
import { Conditions } from "../components/bwc/conditions";
import { HowItWorks } from "../components/bwc/how-it-works";
import { Credibility } from "../components/bwc/credibility";
import { Testimonials } from "../components/bwc/testimonials";
import { Financing } from "../components/bwc/financing";
import { Locations } from "../components/bwc/locations";
import { FinalCta } from "../components/bwc/final-cta";
import { Footer } from "../components/bwc/footer";
import { StickyCta } from "../components/bwc/sticky-cta";
import { ClientOnly } from "../components/bwc/client-only";

const TITLE = "Brain Wellness Center | qEEG Brain Mapping, qpTMS & Neurofeedback in California";
const DESCRIPTION =
  "qEEG brain mapping finds the cause of depression, anxiety, ADHD, autism, and auditory processing symptoms. Personalized qpTMS and neurofeedback at three California offices. Free consultation: (925) 837-1100.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/assets/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: "/assets/og-image.jpg" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/assets/bwc-mark.png" },
      { rel: "apple-touch-icon", href: "/assets/bwc-mark.png" },
    ],
  }),
  component: HomePage,
});

const CLINIC_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  name: "Brain Wellness Center",
  url: "https://brainwellnesscenter.com",
  telephone: "+1-925-837-1100",
  medicalSpecialty: ["Psychiatry", "Neurology"],
  description: DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    streetAddress: "5401 Norris Canyon Rd, Suite 304",
    addressLocality: "San Ramon",
    addressRegion: "CA",
    postalCode: "94583",
    addressCountry: "US",
  },
  department: [
    {
      "@type": "MedicalClinic",
      name: "Brain Wellness Center San Jose",
      telephone: "+1-408-740-3100",
      address: {
        "@type": "PostalAddress",
        streetAddress: "3031 Tisch Way, Suite 309",
        addressLocality: "San Jose",
        addressRegion: "CA",
        postalCode: "95128",
        addressCountry: "US",
      },
    },
    {
      "@type": "MedicalClinic",
      name: "Brain Wellness Center Modesto",
      telephone: "+1-209-253-1700",
      address: {
        "@type": "PostalAddress",
        streetAddress: "1524 McHenry Ave, Suite 415",
        addressLocality: "Modesto",
        addressRegion: "CA",
        postalCode: "95350",
        addressCountry: "US",
      },
    },
  ],
};

function HomePage() {
  return (
    <div className="bwc-page min-h-[100dvh]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(CLINIC_SCHEMA) }}
      />
      <Nav />
      <main>
        <Hero />
        <Conditions />
        <HowItWorks />
        <Credibility />
        <Testimonials />
        <Financing />
        <Locations />
        <FinalCta />
      </main>
      <Footer />
      <ClientOnly>
        <StickyCta />
      </ClientOnly>
    </div>
  );
}
