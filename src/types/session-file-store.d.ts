declare module 'session-file-store' {
  import { Store, SessionData } from 'express-session';

  interface FileStoreOptions {
    path?: string;
    ttl?: number;
    retries?: number;
    factor?: number;
    minTimeout?: number;
    maxTimeout?: number;
    reapInterval?: number;
    reapAsync?: boolean;
    reapSyncFallback?: boolean;
    logFn?: (...args: unknown[]) => void;
    encoding?: string;
    encoder?: (data: SessionData) => string;
    decoder?: (data: string) => SessionData;
    fileExtension?: string;
    fallbackSessionFn?: (sid: string) => SessionData;
  }

  interface FileStoreConstructor {
    new (options?: FileStoreOptions): Store;
  }

  function sessionFileStore(session: unknown): FileStoreConstructor;
  export = sessionFileStore;
}
