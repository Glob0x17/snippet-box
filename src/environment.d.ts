declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      NODE_ENV?: 'development' | 'production' | 'test';
      SESSION_SECRET: string;
      TRUST_PROXY?: string;
      OIDC_ISSUER_URL: string;
      OIDC_CLIENT_ID: string;
      OIDC_CLIENT_SECRET?: string;
      OIDC_REDIRECT_URI: string;
      OIDC_SCOPES?: string;
      OIDC_ALLOWED_EMAILS?: string;
      OIDC_POST_LOGOUT_REDIRECT_URI?: string;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    user?: {
      sub: string;
      email?: string;
      name?: string;
      preferred_username?: string;
    };
    oidc?: {
      codeVerifier: string;
      state: string;
      nonce?: string;
      returnTo?: string;
    };
  }
}

export {};
