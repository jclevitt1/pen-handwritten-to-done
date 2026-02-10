// Environment configuration
// Same Clerk instance as iOS app

export const config = {
  clerk: {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
      'pk_test_c3R1bm5pbmctc2VhaG9yc2UtNC5jbGVyay5hY2NvdW50cy5kZXYk',
  },
  api: {
    // Production AWS Lambda URL (env var can override for local dev)
    baseUrl: import.meta.env.VITE_API_URL || 'https://m9luyofncl.execute-api.us-west-1.amazonaws.com/dev',
  },
} as const;
