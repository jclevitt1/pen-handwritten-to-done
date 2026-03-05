import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const WaitlistCTA = () => {
  const navigate = useNavigate();

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
              Try the <span className="font-handwriting text-gradient">beta</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              Be among the first to turn your handwriting into action.
            </p>

            <Button
              size="lg"
              className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 glow-effect"
              onClick={() => navigate('/beta-testing')}
            >
              Join the Beta
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WaitlistCTA;
