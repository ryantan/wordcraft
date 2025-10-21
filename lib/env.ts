export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'WordCraft',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  isDevelopment: process.env.NEXT_PUBLIC_ENVIRONMENT === 'development',
  isProduction: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production',
  enableXStateInspect: process.env.NEXT_PUBLIC_XSTATE_INSPECT === 'true',
  enableStoryMode: process.env.NEXT_PUBLIC_ENABLE_STORY_MODE !== 'false',
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableOpenAIStoryGeneration: process.env.NEXT_PUBLIC_ENABLE_OPENAI_STORIES === 'true',
} as const;

/**
 * Server-side environment configuration
 * These variables are only available server-side
 */
export const serverEnv = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500', 10),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.8'),
  },
};

/**
 * Validate required environment variables
 * @throws Error if required variables are missing
 */
export function validateEnvironment(): void {
  const required = ['OPENAI_API_KEY'];
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env.local file and ensure all required variables are set.',
    );
  }
}
