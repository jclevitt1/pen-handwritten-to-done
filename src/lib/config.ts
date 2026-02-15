// Environment configuration
// Clerk keys should be set via VITE_CLERK_PUBLISHABLE_KEY env var
// For prod deployment (Vercel), set the prod key in dashboard
//
// For LOCAL TESTING with real Clerk dev instance:
//   Set VITE_CLERK_DEV_KEY in .env.local (not committed)
//   This overrides the prod key for local dev only

export const config = {
  clerk: {
    // Dev key override for local testing, falls back to prod key
    publishableKey: import.meta.env.VITE_CLERK_DEV_KEY || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'https://api.usepen.dev',
  },
} as const;
