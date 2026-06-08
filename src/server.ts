import { join } from 'path';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import sessionFileStoreFactory from 'session-file-store';

import { Logger } from './utils';
import { connectDB } from './db';
import { errorHandler } from './middleware';
import { snippetRouter } from './routes/snippets';
import { associateModels } from './db/associateModels';
import { authRouter, initOIDC, requireAuth } from './auth';

dotenv.config();

const FileStore = sessionFileStoreFactory(session);
const app = express();
const logger = new Logger('server');
const PORT = Number(process.env.PORT) || 5000;
const publicDir = join(__dirname, '../public');

if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

app.use(express.json());
app.use(cookieParser());

const isProd = process.env.NODE_ENV === 'production';
app.use(
  session({
    name: 'snippetbox.sid',
    secret: process.env.SESSION_SECRET || 'change-me',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: new FileStore({
      path: './sessions',
      ttl: 60 * 60 * 24 * 7,
      retries: 1,
      logFn: () => {}
    }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd && process.env.TRUST_PROXY === '1',
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
);

app.use(express.static(publicDir));

app.use('/auth', authRouter);
app.use('/api/snippets', requireAuth, snippetRouter);

app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

app.get(/^\/(?!api(?:\/|$)|auth(?:\/|$))/, (_req: Request, res: Response) => {
  res.sendFile(join(publicDir, 'index.html'));
});

app.use(errorHandler);

(async () => {
  if (!process.env.SESSION_SECRET) {
    logger.log('SESSION_SECRET not set — using insecure default', 'WARN');
  }

  await connectDB();
  await associateModels();
  await initOIDC();

  app.listen(PORT, () => {
    logger.log(
      `Server listening on port ${PORT} (${process.env.NODE_ENV ?? 'development'})`
    );
  });
})().catch(err => {
  logger.log(`Fatal startup error: ${err instanceof Error ? err.message : err}`, 'ERROR');
  process.exit(1);
});

