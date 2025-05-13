import path from 'path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const findPublicFolder = (): string => {
    return path.join(__dirname, '..', '..', '..', 'frontend', 'build');
};
