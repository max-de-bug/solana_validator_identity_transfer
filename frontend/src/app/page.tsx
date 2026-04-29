import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/landing/HeroSection";

// Lazy load below-the-fold sections to minimize initial bundle

const HowItWorksSection = dynamic(() => import("@/components/landing/HowItWorksSection"), {
  ssr: true,
});

const FeaturesSection = dynamic(() => import("@/components/landing/FeaturesSection"), {
  ssr: true,
});

const CTASection = dynamic(() => import("@/components/landing/CTASection"), {
  ssr: true,
});

const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: true,
});

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CTASection />

      <Footer />
    </div>
  );
}
