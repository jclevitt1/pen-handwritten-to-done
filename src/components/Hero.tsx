import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Hero = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success("You're on the list! We'll be in touch soon.");
        setEmail("");
      } else {
        toast.error(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-glow" />
      
      {/* Floating sketch elements */}
      <motion.div
        className="absolute top-1/4 left-[10%] opacity-20"
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="120" height="80" viewBox="0 0 120 80" fill="none" className="stroke-primary">
          <path d="M10 70 Q30 10, 60 40 T110 20" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </motion.div>
      
      <motion.div
        className="absolute bottom-1/4 right-[15%] opacity-20"
        animate={{ y: [0, 10, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" className="stroke-primary">
          <rect x="10" y="10" width="80" height="60" rx="4" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M20 50 L40 30 L60 45 L80 25" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </motion.div>
      
      <div className="container relative z-10 px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          {/* iPad + Apple Pencil badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-4"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary">
              <path d="M20.5 3.5L3.5 20.5M20.5 3.5L16 3.5M20.5 3.5V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-medium text-primary">Built for iPad + Apple Pencil</span>
          </motion.div>
          
          {/* Early access badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Now accepting early access signups</span>
          </motion.div>
          
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
          >
            Write it.{" "}
            <span className="font-handwriting text-gradient">Get it done.</span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12"
          >
            Handwrite anything. Watch it happen.
          </motion.p>
          
          {/* Email signup */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-card border-border text-foreground placeholder:text-muted-foreground"
              required
            />
            <Button 
              type="submit" 
              size="lg"
              disabled={isLoading}
              className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 glow-effect"
            >
              {isLoading ? "Joining..." : "Join Waitlist"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.form>
          
          {/* Visual hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-sm text-muted-foreground"
          >
            Be among the first to experience the future of note-taking.
          </motion.p>
        </div>
        
      </div>
    </section>
  );
};

export default Hero;
