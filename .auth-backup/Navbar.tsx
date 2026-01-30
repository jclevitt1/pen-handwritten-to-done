import { useAuth, useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg"
    >
      <div className="container px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            className="stroke-primary"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 3.5L24.5 7L8.2 23.3L3.5 24.5L4.7 19.8L21 3.5Z" />
            <path d="M17.5 7L21 10.5" />
          </svg>
          <span className="font-semibold text-xl">Pen</span>
        </a>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#how-it-works"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            How it works
          </a>
          <a
            href="#use-cases"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Use cases
          </a>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {isLoaded && isSignedIn ? (
            // Signed in: show dashboard button
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate('/dashboard')}
            >
              {user?.firstName ? `Hi, ${user.firstName}` : 'Dashboard'}
            </Button>
          ) : (
            // Not signed in: show waitlist + sign in
            <>
              <Button
                asChild
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <a href="#waitlist">Join Waitlist</a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-secondary"
                onClick={() => navigate('/sign-in')}
              >
                Sign in
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
