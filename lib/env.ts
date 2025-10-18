export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'WordCraft',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  isDevelopment: process.env.NEXT_PUBLIC_ENVIRONMENT === 'development',
  isProduction: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production',
  enableXStateInspect: process.env.NEXT_PUBLIC_XSTATE_INSPECT === 'true',
  enableStoryMode: process.env.NEXT_PUBLIC_ENABLE_STORY_MODE !== 'false',
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
} as const
