import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const WaitlistCTA = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setTimeout(() => {
      toast.success("You're on the list! We'll reach out soon.");
      setEmail("");
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <section id="waitlist" className="py-24 md:py-32 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-glow opacity-50" />

      <div className="container px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-8 md:p-12 text-center">
            {/* Decorative pen icon */}
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block mb-6"
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                className="stroke-primary"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M36 6L42 12L14 40L6 42L8 34L36 6Z" />
                <path d="M30 12L36 18" />
              </svg>
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join the <span className="font-handwriting text-gradient">beta</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              Be among the first to turn your handwriting into action.
            </p>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-3 py-4"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-lg">You're on the list!</span>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-background border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 glow-effect whitespace-nowrap"
                >
                  {isLoading ? "Joining..." : "Get Early Access"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>
            )}

            <p className="mt-6 text-sm text-muted-foreground">
              No spam. Just early access and updates.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WaitlistCTA;
