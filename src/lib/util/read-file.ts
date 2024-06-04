import { promises as fs } from 'fs';

export const readFile: (file: string) => Promise<string> = async (file) =>
    await fs.readFile(file, 'utf-8');
