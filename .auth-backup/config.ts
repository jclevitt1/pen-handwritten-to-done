// Environment configuration
// Same Clerk instance as iOS app

export const config = {
  clerk: {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
      'pk_test_cXVpY2stdG9ydG9pc2UtMzMuY2xlcmsuYWNjb3VudHMuZGV2JA',
  },
  api: {
    // Production AWS Lambda URL (env var can override for local dev)
    baseUrl: import.meta.env.VITE_API_URL || 'https://nklv393x7j.execute-api.us-west-1.amazonaws.com/dev',
  },
} as const;
