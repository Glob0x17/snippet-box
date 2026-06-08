import path from 'path';
import { Sequelize, QueryInterface } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import { Logger } from '../utils';

const logger = new Logger('db');

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'data/db.sqlite3',
  logging: false
});

export type Migration = (params: { context: QueryInterface }) => Promise<void>;

const umzug = new Umzug({
  migrations: {
    glob: path.join(__dirname, './migrations/*.{ts,js}')
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: undefined
});

export const connectDB = async () => {
  const isDev = process.env.NODE_ENV === 'development';

  try {
    await sequelize.authenticate();
    logger.log('Database connected');

    const pending = await umzug.pending();
    if (pending.length > 0) {
      logger.log('Found pending migrations. Executing...');
      if (isDev) {
        pending.forEach(({ name }) =>
          logger.log(`Executing ${name} migration`, 'DEV')
        );
      }
    }

    await umzug.up();
  } catch (err) {
    logger.log('Database connection error', 'ERROR');
    if (isDev) console.error(err);
    process.exit(1);
  }
};
