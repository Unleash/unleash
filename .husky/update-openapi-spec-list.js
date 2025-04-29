import { readdir, writeFileSync } from 'fs';
import { join, basename } from 'path';

const directoryPath = join(`${import.meta.dirname}/..`, 'src/lib/openapi/spec');
const indexPath = join(directoryPath, 'index.ts');

// Read files from the directory
readdir(directoryPath, (err, files) => {
    if (err) {
        console.error('Could not list the directory.', err);
        process.exit(1);
    }

    const exports = files
        .filter((file) => file.includes('schema.ts')) // Filter files by 'schema.ts'
        .map((file) => `export * from './${file.replace('.ts', '')}';`) // Create export statements
        .join('\n');

    // Append export statements to index.ts
    const script = basename(import.meta.filename);
    const message = `/**
 * Auto-generated file by ${script}. Do not edit.
 * To run it manually execute \`yarn schema:update\` or \`node ${basename(import.meta.dirname)}/${script}\`
 */\n`;
    writeFileSync(indexPath, `${message}${exports}\n${message}`, (err) => {
        if (err) {
            console.error('Could not append to file.', err);
            process.exit(1);
        }
        console.log('Export statements added to index.ts successfully.');
    });
});
