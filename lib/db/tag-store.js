'use strict';

const metricsHelper = require('../metrics-helper');
const { DB_TIME } = require('../events');
const NotFoundError = require('../error/notfound-error');

const COLUMNS = ['type', 'value'];
const TABLE = 'tags';
class TagStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.logger = getLogger('tag-store.js');
        this.timer = action =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'tag',
                action,
            });
    }

    async getTagsByType(type) {
        const stopTimer = this.timer('getTagByType');
        const rows = await this.db
            .select(COLUMNS)
            .from(TABLE)
            .where({ type });
        stopTimer();
        return rows.map(this.rowToTag);
    }

    async getAll() {
        const stopTimer = this.timer('getAll');
        const rows = await this.db.select(COLUMNS).from(TABLE);
        stopTimer();
        return rows.map(this.rowToTag);
    }

    async getTag(type, value) {
        const stopTimer = this.timer('getTag');
        const tag = await this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ type, value });
        stopTimer();
        if (!tag) {
            throw new NotFoundError(
                `No tag with type: [${type}] and value [${value}]`,
            );
        }
        return tag;
    }

    async createTag(tag) {
        const stopTimer = this.timer('createTag');
        await this.db(TABLE).insert(tag);
        stopTimer();
    }

    async deleteTag(tag) {
        const stopTimer = this.timer('deleteTag');
        await this.db(TABLE)
            .where(tag)
            .del();
        stopTimer();
    }

    rowToTag(row) {
        return {
            type: row.type,
            value: row.value,
        };
    }
}
module.exports = TagStore;
