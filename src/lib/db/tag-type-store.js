'use strict';

const metricsHelper = require('../metrics-helper');
const { DB_TIME } = require('../events');
const NotFoundError = require('../error/notfound-error');

const COLUMNS = ['name', 'description', 'icon'];
const TABLE = 'tag_types';

class TagTypeStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.logger = getLogger('tag-type-store.js');
        this.timer = action =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'tag-type',
                action,
            });
    }

    async getAll() {
        const stopTimer = this.timer('getTagTypes');
        const rows = await this.db.select(COLUMNS).from(TABLE);
        stopTimer();
        return rows.map(this.rowToTagType);
    }

    async getTagType(name) {
        const stopTimer = this.timer('getTagTypeByName');
        return this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ name })
            .then(row => {
                stopTimer();
                if (!row) {
                    throw new NotFoundError('Could not find tag-type');
                } else {
                    return this.rowToTagType(row);
                }
            });
    }

    async exists(name) {
        const stopTimer = this.timer('exists');
        const row = await this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ name });
        stopTimer();
        return row;
    }

    async createTagType(newTagType) {
        const stopTimer = this.timer('createTagType');
        await this.db(TABLE).insert(newTagType);
        stopTimer();
    }

    async deleteTagType(name) {
        const stopTimer = this.timer('deleteTagType');
        await this.db(TABLE)
            .where({ name })
            .del();
        stopTimer();
    }

    async dropTagTypes() {
        const stopTimer = this.timer('dropTagTypes');
        await this.db(TABLE).del();
        stopTimer();
    }

    async bulkImport(tagTypes) {
        const rows = await this.db(TABLE)
            .insert(tagTypes)
            .returning(COLUMNS)
            .onConflict('name')
            .ignore();
        if (rows.length > 0) {
            return rows;
        }
        return [];
    }

    async updateTagType({ name, description, icon }) {
        const stopTimer = this.timer('updateTagType');
        await this.db(TABLE)
            .where({ name })
            .update({ description, icon });
        stopTimer();
    }

    rowToTagType(row) {
        return {
            name: row.name,
            description: row.description,
            icon: row.icon,
        };
    }
}

module.exports = TagTypeStore;
