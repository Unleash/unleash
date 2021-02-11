/* eslint camelcase: "off" */

'use strict';

const TABLE = 'settings';

class SettingStore {
    constructor(db, getLogger) {
        this.db = db;
        this.logger = getLogger('settings-store.js');
    }

    async updateRow(name, content) {
        return this.db(TABLE)
            .where('name', name)
            .update({
                content: JSON.stringify(content),
            });
    }

    async insertNewRow(name, content) {
        return this.db(TABLE).insert({ name, content });
    }

    async insert(name, content) {
        const result = await this.db(TABLE)
            .count('*')
            .where('name', name)
            .first();

        if (Number(result.count) > 0) {
            return this.updateRow(name, content);
        }
        return this.insertNewRow(name, content);
    }

    async get(name) {
        const result = await this.db
            .select()
            .from(TABLE)
            .where('name', name);

        if (result.length > 0) {
            return result[0].content;
        }
        return undefined;
    }
}

module.exports = SettingStore;
