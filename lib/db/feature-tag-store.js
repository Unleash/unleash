'use strict';

const metricsHelper = require('../metrics-helper');
const { DB_TIME } = require('../events');
const {
    TAG_CREATED,
    TAG_DELETED,
    FEATURE_TAGGED,
    FEATURE_UNTAGGED,
} = require('../event-type');
const { CREATE_TAG, DELETE_TAG } = require('../command-type');
const NotFoundError = require('../error/notfound-error');

const COLUMNS = ['type', 'value'];
const FEATURE_TAG_COLUMNS = ['feature_name', 'tag_type', 'tag_value'];
const TABLE = 'tags';
const FEATURE_TAG_TABLE = 'feature_tag';

class FeatureTagStore {
    constructor(db, eventStore, eventBus, getLogger) {
        this.db = db;
        this.eventStore = eventStore;
        this.logger = getLogger('feature-tag-store.js');

        this.timer = action =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'tag',
                action,
            });

        eventStore.on(CREATE_TAG, event => this._createTag(event.data));
        eventStore.on(DELETE_TAG, event => this._deleteTag(event.data));
    }

    async getTags() {
        const stopTimer = this.timer('getTags');
        const rows = await this.db.select(COLUMNS).from(TABLE);
        stopTimer();
        return rows.map(this.rowToTag);
    }

    async getAllOfType(type) {
        const stopTimer = this.timer('getAllOfType');

        const rows = await this.db
            .select(COLUMNS)
            .from(TABLE)
            .where({ type });

        stopTimer();

        return rows.map(this.rowToTag());
    }

    async getAllTagsForFeature(featureName) {
        const stopTimer = this.timer('getAllForFeature');
        const rows = await this.db
            .select(FEATURE_TAG_COLUMNS)
            .from(FEATURE_TAG_TABLE)
            .where({ feature_name: featureName });
        stopTimer();
        return rows.map(this.featureTagRowToTag);
    }

    async getTagByTypeAndValue(type, value) {
        const stopTimer = this.timer('getTagByTypeAndValue');
        const row = await this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ type, value });
        stopTimer();
        if (!row) {
            throw new NotFoundError('Could not find this tag');
        }
        return this.rowToTag(row);
    }

    async hasTag(tag) {
        const stopTimer = this.timer('hasTag');
        const row = await this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({
                type: tag.type,
                value: tag.value,
            });
        stopTimer();
        if (!row) {
            throw new NotFoundError('No tag found');
        }
        return this.rowToTag(row);
    }

    async tagFeature(event) {
        const stopTimer = this.timer('tagFeature');
        const tag = this.eventDataToRow(event);
        try {
            await this.hasTag(tag);
        } catch (err) {
            if (err instanceof NotFoundError) {
                this.logger.info(`Tag ${tag} did not exist. Creating.`);
                await this._createTag(tag);
            } else {
                this.logger.debug('Already existed');
            }
        }
        await this.db(FEATURE_TAG_TABLE)
            .insert({
                feature_name: event.featureName,
                tag_type: tag.type,
                tag_value: tag.value,
            })
            .onConflict(['feature_name', 'tag_type', 'tag_value'])
            .ignore();
        stopTimer();
        await this.eventStore.store({
            type: FEATURE_TAGGED,
            createdBy: event.createdBy || 'unleash-system',
            data: {
                featureName: event.featureName,
                tag,
            },
        });
        return tag;
    }

    async untagFeature(event) {
        const stopTimer = this.timer('untagFeature');
        try {
            await this.db(FEATURE_TAG_TABLE)
                .where({
                    feature_name: event.featureName,
                    tag_type: event.tagType,
                    tag_value: event.tagValue,
                })
                .delete();
            await this.eventStore.store({
                type: FEATURE_UNTAGGED,
                createdBy: event.createdBy || 'unleash-system',
                data: {
                    featureName: event.featureName,
                    tag: {
                        value: event.tagValue,
                        type: event.tagType,
                    },
                },
            });
        } catch (err) {
            this.logger.error(err);
        }
        stopTimer();
    }

    async _createTag(event) {
        const stopTimer = this.timer('createTag');
        await this.db(TABLE)
            .insert(this.eventDataToRow(event))
            .onConflict(['type', 'value'])
            .ignore();
        await this.eventStore.store({
            type: TAG_CREATED,
            createdBy: event.createdBy || 'unleash-system',
            data: {
                value: event.value,
                type: event.type,
            },
        });
        stopTimer();
        return { value: event.value, type: event.type };
    }

    async _deleteTag(event) {
        const stopTimer = this.timer('deleteTag');
        const tag = this.eventDataToRow(event);
        try {
            await this.db(TABLE)
                .where(tag)
                .del();
            await this.eventStore.store({
                type: TAG_DELETED,
                createdBy: event.createdBy || 'unleash-system',
                data: tag,
            });
        } catch (err) {
            this.logger.error('Could not delete tag, error: ', err);
        }
        stopTimer();
    }

    rowToTag(row) {
        if (row) {
            return {
                value: row.value,
                type: row.type,
            };
        }
        return null;
    }

    featureTagRowToTag(row) {
        if (row) {
            return {
                value: row.tag_value,
                type: row.tag_type,
            };
        }
        return null;
    }

    eventDataToRow(event) {
        return {
            value: event.value,
            type: event.type,
        };
    }
}

module.exports = FeatureTagStore;
