declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_APP_NAME: string
    NEXT_PUBLIC_APP_VERSION: string
    NEXT_PUBLIC_ENVIRONMENT: 'development' | 'staging' | 'production'
    NEXT_PUBLIC_XSTATE_INSPECT?: string
    NEXT_PUBLIC_ENABLE_STORY_MODE?: string
    NEXT_PUBLIC_ENABLE_ANALYTICS?: string
  }
}
