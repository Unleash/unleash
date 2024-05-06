import type { Logger, LogProvider } from '../logger';
import type { ISettingStore } from '../types/stores/settings-store';
import type { Db } from './db';

const TABLE = 'settings';

export default class SettingStore implements ISettingStore {
    private db: Db;

    private logger: Logger;

    constructor(db: Db, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('settings-store.ts');
    }

    async postgresVersion(): Promise<string> {
        try {
            const showResult = await this.db.raw('SHOW server_version');
            return showResult?.rows[0]?.server_version || '';
        } catch (e) {
            this.logger.warn('Failed to fetch postgres version', e);
            return '';
        }
    }

    async updateRow(name: string, content: any): Promise<void> {
        return this.db(TABLE)
            .where('name', name)
            .update({
                content: JSON.stringify(content),
            });
    }

    async insertNewRow(name: string, content: any) {
        return this.db(TABLE).insert({ name, content });
    }

    async exists(name: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE name = ?) AS present`,
            [name],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get<T>(name: string): Promise<T | undefined> {
        const result = await this.db
            .select()
            .from(TABLE)
            .where('name', name)
            .limit(1);

        if (result.length > 0) {
            return result[0].content;
        }
        return undefined;
    }

    async insert(name: string, content: any): Promise<void> {
        const exists = await this.exists(name);
        if (exists) {
            await this.updateRow(name, content);
        } else {
            await this.insertNewRow(name, content);
        }
    }

    async delete(name: string): Promise<void> {
        await this.db(TABLE).where({ name }).del();
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    destroy(): void {}

    async getAll(): Promise<any[]> {
        const rows = await this.db(TABLE).select();
        return rows.map((r) => r.content);
    }
}

module.exports = SettingStore;
