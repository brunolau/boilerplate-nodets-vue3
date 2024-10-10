import { drizzleEftify } from "eftify-drizzle-pg";
import postgres from "postgres";
import appConfig from "src/config/appConfig";
import * as schema from '../schema/schema';


const getDbUrl = () => {
	if (process.env.DB_URL == null || process.env.DB_URL?.toString()?.trim()?.length == 0) {
		throw 'No DB_URL provided in the .env file, aborting'
	}

	return process.env.DB_URL;
}

//const migrationConnection = postgres(DB_URL, { max: 1 });
const queryConnection = postgres(getDbUrl());

if (appConfig.database.traceTimeEnabled) {
	drizzleEftify.config.traceEnabled = true;
}

export const drizzleDb = drizzleEftify.create(queryConnection, {
	logger: true,
	schema: schema
});

export const db = drizzleDb.eftify;