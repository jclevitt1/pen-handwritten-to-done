import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container px-6">
        {/* Platform note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-border bg-card/50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary">
              <path d="M20.5 3.5L3.5 20.5M20.5 3.5L16 3.5M20.5 3.5V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm text-muted-foreground">
              Available soon on the App Store
            </p>
          </div>
        </motion.div>

        {/* Founder + Affiliations */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-4 mb-8"
        >
          <a
            href="https://www.linkedin.com/in/jeremy-levitt-b5b230170/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Jeremy Levitt, Founder
          </a>
          <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
            <span>Founder from</span>
          </div>
          <div className="grid grid-cols-3 items-center w-full max-w-lg opacity-60">
            <div className="flex justify-center">
              <img src="/logos/aws.svg" alt="AWS" className="h-8 brightness-0 invert" />
            </div>
            <div className="flex justify-center">
              <img src="/logos/berkeley.svg" alt="UC Berkeley" className="h-[70px] brightness-0 invert" />
            </div>
            <div className="flex justify-center">
              <img src="/logos/columbia.svg" alt="Columbia University" className="h-[110px] brightness-0 invert" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="stroke-primary"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 3L21 6L7 20L3 21L4 17L18 3Z" />
            </svg>
            <span className="font-semibold text-lg">Pen</span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Pen. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
