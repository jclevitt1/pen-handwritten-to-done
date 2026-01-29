import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Hero = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("You're on the list! We'll be in touch soon.");
      setEmail("");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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
            Your handwriting becomes reality. Code, summaries, edits—just draw what you want.
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
        
        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 md:mt-24 max-w-3xl mx-auto"
        >
          <div className="relative rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8 md:p-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            
            {/* Sketch to result visualization */}
            <div className="relative flex flex-col md:flex-row items-center justify-center gap-8">
              {/* Handwritten side */}
              <div className="flex-1 text-center">
                <div className="font-handwriting text-3xl md:text-4xl text-primary leading-relaxed">
                  create a login page<br />
                  with email & password
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Your sketch</p>
              </div>
              
              {/* Arrow */}
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="hidden md:block"
              >
                <ArrowRight className="w-8 h-8 text-primary" />
              </motion.div>
              
              {/* Result side */}
              <div className="flex-1 text-center">
                <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm text-left">
                  <span className="text-primary">const</span> LoginPage = () =&gt; {"{"}
                  <br />
                  {"  "}<span className="text-muted-foreground">// Generated code...</span>
                  <br />
                  {"}"};
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Working code</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
