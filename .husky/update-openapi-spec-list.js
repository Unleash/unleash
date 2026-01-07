import { readdir, writeFileSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const directoryPath = join(`${__dirname}/..`, 'src/lib/openapi/spec');
const indexPath = join(directoryPath, 'index.ts');

// Read files from the directory
readdir(directoryPath, (err, files) => {
    if (err) {
        console.error('Could not list the directory.', err);
        process.exit(1);
    }

    const exports = files
        .filter((file) => file.includes('schema.ts')) // Filter files by 'schema.ts'
        .map((file) => `export * from './${file.replace('.ts', '.js')}';`) // Create export statements
        .join('\n');

    // Append export statements to index.ts
    const script = basename(__filename);
    const message = `/**
 * Auto-generated file by ${script}. Do not edit.
 * To run it manually execute \`yarn schema:update\` or \`node ${basename(__dirname)}/${script}\`
 */\n`;
    writeFileSync(indexPath, `${message}${exports}\n${message}`, (err) => {
        if (err) {
            console.error('Could not append to file.', err);
            process.exit(1);
        }
        console.log('Export statements added to index.ts successfully.');
    });
});
