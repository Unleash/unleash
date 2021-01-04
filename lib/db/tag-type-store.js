'use strict';

const metricsHelper = require('../metrics-helper');
const {
    CREATE_TAG_TYPE,
    DELETE_TAG_TYPE,
    UPDATE_TAG_TYPE,
} = require('../command-type');
const { TAG_TYPE_CREATED, TAG_TYPE_DELETED } = require('../event-type');
const { DB_TIME } = require('../events');
const NotFoundError = require('../error/notfound-error');

const COLUMNS = ['name', 'description', 'icon'];
const TABLE = 'tag_types';

class TagTypeStore {
    constructor(db, eventStore, eventBus, getLogger) {
        this.db = db;
        this.eventStore = eventStore;
        this.logger = getLogger('tag-type-store.js');
        this.timer = action =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'tag-type',
                action,
            });

        eventStore.on(CREATE_TAG_TYPE, event =>
            this._createTagType(event.data),
        );
        eventStore.on(DELETE_TAG_TYPE, event =>
            this._deleteTagType(event.data),
        );
        eventStore.on(UPDATE_TAG_TYPE, event =>
            this._updateTagType(event.data),
        );
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

    async _createTagType(event) {
        const stopTimer = this.timer('createTagType');
        try {
            const data = this.eventDataToRow(event);
            await this.db(TABLE).insert(data);
            await this.eventStore.store({
                type: TAG_TYPE_CREATED,
                createdBy: event.createdBy || 'unleash-system',
                data,
            });
        } catch (err) {
            this.logger.error('Could not insert tag type, error: ', err);
        }
        stopTimer();
    }

    async _updateTagType(event) {
        const stopTimer = this.timer('updateTagType');
        try {
            const { description, icon } = this.eventDataToRow(event);
            await this.db(TABLE)
                .where({ name: event.name })
                .update({ description, icon });
            stopTimer();
        } catch (err) {
            this.logger.error('Could not update tag type, error: ', err);
            stopTimer();
        }
    }

    async _deleteTagType(event) {
        const stopTimer = this.timer('deleteTagType');
        try {
            const data = this.eventDataToRow(event);
            await this.db(TABLE)
                .where({
                    name: data.name,
                })
                .del();
            await this.eventStore.store({
                type: TAG_TYPE_DELETED,
                createdBy: event.createdBy || 'unleash-system',
                data,
            });
        } catch (err) {
            this.logger.error('Could not delete tag, error: ', err);
        }
        stopTimer();
    }

    rowToTagType(row) {
        return {
            name: row.name,
            description: row.description,
            icon: row.icon,
        };
    }

    eventDataToRow(event) {
        return {
            name: event.name.toLowerCase(),
            description: event.description,
            icon: event.icon,
        };
    }
}

module.exports = TagTypeStore;
