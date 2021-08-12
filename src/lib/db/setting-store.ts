import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import { ISettingStore } from '../types/stores/settings-store';

const TABLE = 'settings';

export default class SettingStore implements ISettingStore {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('settings-store.ts');
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async updateRow(name: string, content: any): Promise<void> {
        return this.db(TABLE)
            .where('name', name)
            .update({
                content: JSON.stringify(content),
            });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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

    async get(name: string): Promise<any> {
        const result = await this.db.select().from(TABLE).where('name', name);

        if (result.length > 0) {
            return result[0].content;
        }
        return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
