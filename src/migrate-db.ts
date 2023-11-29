import { applyDbMigration } from './lib/server-impl';

try {
    const useLock = true;
    applyDbMigration(useLock);
} catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit();
}
