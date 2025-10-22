/**
 * OpenAI API Client
 *
 * Manages connection and authentication with OpenAI API
 */

import { serverEnv, validateEnvironment } from '@/lib/env';
import OpenAI from 'openai';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second
const MAX_DELAY = 10000; // 10 seconds

/**
 * Create and configure OpenAI client instance
 * @returns Configured OpenAI client
 * @throws Error if OPENAI_API_KEY is not set
 */
export function createOpenAIClient(): OpenAI {
  const apiKey = serverEnv.openai.apiKey;

  if (!apiKey) {
    throw new OpenAIConfigError('OPENAI_API_KEY environment variable is not set');
  }

  return new OpenAI({
    apiKey,
    maxRetries: 3,
    timeout: 30000, // 30 seconds
  });
}

// TODO: Consider caching the OpenAI client instance so there's only 1 created.
let openAIClient: ReturnType<typeof createOpenAIClient> | null = null;

/**
 * Get or create OpenAI client with environment validation
 * @returns OpenAI client instance or null if disabled
 */
export function getOpenAIClient(): ReturnType<typeof createOpenAIClient> | null {
  // Skip in test/development without API key
  if (process.env.NODE_ENV === 'test' || !process.env.OPENAI_API_KEY) {
    return null;
  }

  if (!openAIClient) {
    try {
      validateEnvironment();
      openAIClient = createOpenAIClient();
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error);
      return null;
    }
  }

  return openAIClient;
}

/**
 * Custom error class for OpenAI configuration errors
 */
export class OpenAIConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenAIConfigError';
  }
}

/**
 * Custom error class for OpenAI API errors
 */
export class OpenAIAPIError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'OpenAIAPIError';
  }
}

/**
 * Validate OpenAI API key format
 * @param apiKey - API key to validate
 * @returns True if valid format
 */
export function validateAPIKey(apiKey: string): boolean {
  return apiKey.startsWith('sk-') && apiKey.length > 20;
}

/**
 * Test OpenAI connection
 * @param client - OpenAI client instance
 * @returns True if connection successful
 */
export async function testConnection(client: OpenAI): Promise<boolean> {
  try {
    const response = await client.models.list();
    return response.data.length > 0;
  } catch {
    return false;
  }
}

/**
 * Retry wrapper with exponential backoff
 * @param fn - Function to retry
 * @param retries - Number of retry attempts
 * @returns Result of function or throws after all retries
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
): Promise<T> {
  let lastError: unknown;
  let delay = INITIAL_DELAY;

  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i === retries) {
        throw lastError;
      }

      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.min(delay, MAX_DELAY)));
      delay *= 2;
    }
  }

  throw lastError;
}

/**
 * Execute with timeout
 * @param promise - Promise to timeout
 * @param timeoutMs - Timeout in milliseconds
 * @returns Result or throws timeout error
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new OpenAIAPIError('Request timed out', 408, 'timeout'));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}
