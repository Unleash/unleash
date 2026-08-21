import { createConfig } from './lib/create-config.js';
import { migrateDb } from './migrator.js';

try {
    await migrateDb(createConfig({}));
} catch (error) {
    console.error('Database migration failed', error);
    process.exitCode = 1;
}
