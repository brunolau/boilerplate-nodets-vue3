import "reflect-metadata";
import 'dotenv/config'
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzleDb } from '../../src/db/drizzle/db';

const main = async () => {
    await migrate(drizzleDb, { migrationsFolder: './drizzle' });
};

main();

