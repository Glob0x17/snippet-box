import * as client from 'openid-client';
import { Logger } from '../utils';

const logger = new Logger('oidc');

let config: client.Configuration | null = null;

export const initOIDC = async (): Promise<client.Configuration> => {
  const issuerUrl = process.env.OIDC_ISSUER_URL;
  const clientId = process.env.OIDC_CLIENT_ID;
  const clientSecret = process.env.OIDC_CLIENT_SECRET;

  if (!issuerUrl || !clientId) {
    throw new Error(
      'OIDC_ISSUER_URL and OIDC_CLIENT_ID must be set in the environment'
    );
  }

  config = await client.discovery(
    new URL(issuerUrl),
    clientId,
    clientSecret || undefined
  );

  logger.log(`OIDC discovery succeeded for ${issuerUrl}`);
  return config;
};

export const getConfig = (): client.Configuration => {
  if (!config) {
    throw new Error('OIDC client not initialised — call initOIDC() first');
  }
  return config;
};

export const getScopes = (): string =>
  process.env.OIDC_SCOPES || 'openid profile email';

export const getRedirectUri = (): string => {
  const uri = process.env.OIDC_REDIRECT_URI;
  if (!uri) {
    throw new Error('OIDC_REDIRECT_URI must be set');
  }
  return uri;
};

export const getAllowedEmails = (): string[] | null => {
  const raw = process.env.OIDC_ALLOWED_EMAILS?.trim();
  if (!raw) return null;
  return raw
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
};

export const isEmailAllowed = (email: string | undefined): boolean => {
  const allowed = getAllowedEmails();
  if (allowed === null) return true;
  if (!email) return false;
  return allowed.includes(email.toLowerCase());
};
