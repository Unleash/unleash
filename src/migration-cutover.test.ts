import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { LEGACY_MIGRATION_CUTOFF } from './migrator.js';

test('new migrations are added to the Knex migration directory', async () => {
    const legacyMigrations = (
        await readdir(path.join(import.meta.dirname, 'migrations'))
    )
        .filter((filename) => filename.endsWith('.js'))
        .sort();

    expect(legacyMigrations.at(-1)).toBe(LEGACY_MIGRATION_CUTOFF);
});
