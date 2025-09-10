import { createConfig } from './lib/create-config.js';
import { migrateDb } from './migrator.js';

async function runMigrations() {
  try {
      console.log('Starting database migrations...');
      const config = createConfig({});
      await migrateDb(config);
      console.log('Migrations completed successfully!');
      process.exit(0);
  } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
  }
}

runMigrations();
