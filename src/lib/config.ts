// Environment configuration
// Same Clerk instance as iOS app

export const config = {
  clerk: {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
      'pk_test_cXVpY2stdG9ydG9pc2UtMzMuY2xlcmsuYWNjb3VudHMuZGV2JA',
  },
  api: {
    // Update after deploying backend
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  },
} as const;
