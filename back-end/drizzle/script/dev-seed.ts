import "reflect-metadata";
import 'dotenv/config'
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzleDb } from '../../src/db/drizzle/db';
import DataContext from '../../src/db/dataContext';
import LocalizedText from "../../src/data/data-contracts/localized-text";

const main = async () => {
    const db = DataContext.create();
    const createLocalizedText = (txt: string): LocalizedText => {
        return {
            sk: txt
        } as any
    };

    const count = 0;

    if (count == 0) {
        // Seed data
    }
};

main();

