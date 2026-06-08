import { Router, Request, Response } from 'express';
import * as client from 'openid-client';
import {
  getConfig,
  getRedirectUri,
  getScopes,
  isEmailAllowed
} from './oidc';
import { Logger } from '../utils';

const logger = new Logger('auth');
export const authRouter = Router();

authRouter.get('/login', async (req: Request, res: Response) => {
  const config = getConfig();

  const codeVerifier = client.randomPKCECodeVerifier();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const state = client.randomState();
  const nonce = client.randomNonce();

  const returnTo = typeof req.query.returnTo === 'string' ? req.query.returnTo : '/';

  req.session.oidc = { codeVerifier, state, nonce, returnTo };

  const authUrl = client.buildAuthorizationUrl(config, {
    redirect_uri: getRedirectUri(),
    scope: getScopes(),
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
    nonce
  });

  res.redirect(authUrl.href);
});

authRouter.get('/callback', async (req: Request, res: Response) => {
  const config = getConfig();
  const handshake = req.session.oidc;

  if (!handshake) {
    res.status(400).json({ error: 'No active OIDC handshake' });
    return;
  }

  try {
    const currentUrl = new URL(
      req.originalUrl,
      `${req.protocol}://${req.get('host')}`
    );

    const tokens = await client.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: handshake.codeVerifier,
      expectedState: handshake.state,
      expectedNonce: handshake.nonce
    });

    const claims = tokens.claims();
    if (!claims) {
      throw new Error('ID token has no claims');
    }

    const email =
      typeof claims.email === 'string' ? claims.email : undefined;

    if (!isEmailAllowed(email)) {
      logger.log(`Access denied for ${email ?? claims.sub}`, 'WARN');
      req.session.oidc = undefined;
      res.status(403).send('Access denied for this account.');
      return;
    }

    req.session.user = {
      sub: String(claims.sub),
      email,
      name: typeof claims.name === 'string' ? claims.name : undefined,
      preferred_username:
        typeof claims.preferred_username === 'string'
          ? claims.preferred_username
          : undefined
    };

    const returnTo = handshake.returnTo || '/';
    req.session.oidc = undefined;

    req.session.save(err => {
      if (err) {
        logger.log(`Session save error: ${err.message}`, 'ERROR');
        res.status(500).send('Session error');
        return;
      }
      res.redirect(returnTo);
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.log(`Callback error: ${msg}`, 'ERROR');
    res.status(400).json({ error: 'OIDC callback failed' });
  }
});

authRouter.get('/me', (req: Request, res: Response) => {
  if (!req.session.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.json({ data: req.session.user });
});

authRouter.post('/logout', (req: Request, res: Response) => {
  const target = process.env.OIDC_POST_LOGOUT_REDIRECT_URI || '/';
  req.session.destroy(err => {
    if (err) {
      logger.log(`Logout error: ${err.message}`, 'ERROR');
      res.status(500).json({ error: 'Logout failed' });
      return;
    }
    res.clearCookie('connect.sid');
    res.json({ data: { redirect: target } });
  });
});
