import { join } from 'path';
import { promises } from 'fs';
import { safeName } from '../helpers';

const { writeFile, readFile } = promises;

export interface StorageProvider<T> {
    set(key: string, data: T): Promise<void>;
    get(key: string): Promise<T | undefined>;
}

export interface StorageOptions {
    backupPath: string;
}

export class FileStorageProvider<T> implements StorageProvider<T> {
    private backupPath: string;

    constructor(backupPath: string) {
        if (!backupPath) {
            throw new Error('backup Path is required');
        }
        this.backupPath = backupPath;
    }

    private getPath(key: string): string {
        return join(this.backupPath, `/unleash-backup-${safeName(key)}.json`);
    }

    async set(key: string, data: T): Promise<void> {
        return writeFile(this.getPath(key), JSON.stringify(data));
    }

    async get(key: string): Promise<T | undefined> {
        const path = this.getPath(key);
        let data;
        try {
            data = await readFile(path, 'utf8');
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                throw error;
            } else {
                return undefined;
            }
        }

        if (!data || data.trim().length === 0) {
            return undefined;
        }

        try {
            return JSON.parse(data);
        } catch (error: any) {
            if (error instanceof Error) {
                error.message = `Unleash storage failed parsing file ${path}: ${error.message}`;
            }
            throw error;
        }
    }
}
