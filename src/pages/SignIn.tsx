import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

const SignIn = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 justify-center mb-8">
          <svg
            width="32"
            height="32"
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
          <span className="font-semibold text-2xl">Pen</span>
        </a>

        {/* Clerk SignIn component */}
        <ClerkSignIn
          appearance={{
            elements: {
              rootBox: 'w-full flex justify-center',
              card: 'bg-card border border-border shadow-lg',
              headerTitle: 'text-foreground',
              headerSubtitle: 'text-muted-foreground',
              socialButtonsBlockButton: 'border-border hover:bg-secondary',
              socialButtonsBlockButtonText: 'text-foreground',
              dividerLine: 'bg-border',
              dividerText: 'text-muted-foreground',
              formFieldLabel: 'text-foreground',
              formFieldInput: 'bg-background border-border text-foreground',
              formButtonPrimary: 'bg-primary hover:bg-primary/90',
              footerActionLink: 'text-primary hover:text-primary/90',
              identityPreviewText: 'text-foreground',
              identityPreviewEditButton: 'text-primary',
            },
          }}
          redirectUrl="/dashboard"
          signUpUrl="/sign-up"
        />
      </motion.div>
    </div>
  );
};

export default SignIn;
