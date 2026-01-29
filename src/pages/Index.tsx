import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import UseCases from "@/components/UseCases";
import WaitlistCTA from "@/components/WaitlistCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <HowItWorks />
        <UseCases />
        <WaitlistCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
