import { motion } from 'framer-motion';
import { Smartphone, Link, Mail, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const steps = [
  {
    icon: Smartphone,
    title: 'Download TestFlight',
    description: (
      <>
        Install the{' '}
        <a
          href="https://apps.apple.com/us/app/testflight/id899247664"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary/80"
        >
          TestFlight app
        </a>{' '}
        (made by Apple) on your iPad from the App Store.
      </>
    ),
  },
  {
    icon: Link,
    title: 'Open the invite link on your iPad',
    description: (
      <>
        Tap the link below on your iPad to join the Pen beta:{' '}
        <a
          href="https://testflight.apple.com/join/tkm4DJTG"
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-3 text-primary underline underline-offset-2 hover:text-primary/80 break-all"
        >
          https://testflight.apple.com/join/tkm4DJTG
        </a>
      </>
    ),
  },
  {
    icon: Mail,
    title: 'Request textbooks',
    description: (
      <>
        Need a textbook we don't support yet? Email{' '}
        <a
          href="mailto:jclevitt@usepen.dev"
          className="text-primary underline underline-offset-2 hover:text-primary/80"
        >
          jclevitt@usepen.dev
        </a>{' '}
        or text Jeremy at{' '}
        <a
          href="sms:+18185177092"
          className="text-primary underline underline-offset-2 hover:text-primary/80"
        >
          (818) 517-7092
        </a>{' '}
        with the title, author, and course name and we'll add it.
      </>
    ),
  },
];

const BetaTesting = () => {
  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          <div className="container px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <span className="text-sm uppercase tracking-wider text-primary mb-4 block">
                Early access
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Join the{' '}
                <span className="font-handwriting text-gradient">Beta</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get early access to Pen on your iPad with unlimited credit reloads. Help us shape the future of handwritten notes.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Steps */}
        <section className="pb-24 md:pb-32">
          <div className="container px-6 max-w-2xl mx-auto">
            <div className="space-y-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.15, duration: 0.5 }}
                  className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 md:p-8 flex gap-5 items-start transition-colors hover:border-primary/30"
                >
                  {/* Step number + icon */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 w-7 h-7 rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <step.icon className="w-5 h-5 text-muted-foreground" />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      {step.title}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BetaTesting;
