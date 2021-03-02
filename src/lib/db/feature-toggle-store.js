'use strict';

const metricsHelper = require('../metrics-helper');
const { DB_TIME } = require('../events');
const NotFoundError = require('../error/notfound-error');
const FeatureHasTagError = require('../error/feature-has-tag-error');
const { UNIQUE_CONSTRAINT_VIOLATION } = require('../error/db-error');

const FEATURE_COLUMNS = [
    'name',
    'description',
    'type',
    'project',
    'enabled',
    'stale',
    'strategies',
    'variants',
    'created_at',
    'last_seen_at',
];

const mapperToColumnNames = {
    createdAt: 'created_at',
    lastSeenAt: 'last_seen_at',
};
const TABLE = 'features';
const FEATURE_TAG_COLUMNS = ['feature_name', 'tag_type', 'tag_value'];
const FEATURE_TAG_FILTER_COLUMNS = ['tag_type', 'tag_value'];
const FEATURE_TAG_TABLE = 'feature_tag';

class FeatureToggleStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.logger = getLogger('feature-toggle-store.js');
        this.timer = action =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'feature-toggle',
                action,
            });
    }

    async getFeatures(query = {}, fields = FEATURE_COLUMNS) {
        const stopTimer = this.timer('getAll');
        const queryFields = fields.map(f =>
            mapperToColumnNames[f] ? mapperToColumnNames[f] : f,
        );
        let baseQuery = this.db
            .select(queryFields)
            .from(TABLE)
            .where({ archived: 0 })
            .orderBy('name', 'asc');
        if (query) {
            if (query.tag) {
                const tagQuery = this.db
                    .from('feature_tag')
                    .select('feature_name')
                    .whereIn(FEATURE_TAG_FILTER_COLUMNS, query.tag);
                baseQuery = baseQuery.whereIn('name', tagQuery);
            }
            if (query.project) {
                baseQuery = baseQuery.whereIn('project', query.project);
            }
            if (query.namePrefix) {
                baseQuery = baseQuery.where(
                    'name',
                    'like',
                    `${query.namePrefix}%`,
                );
            }
        }
        const rows = await baseQuery;
        stopTimer();

        return rows.map(this.rowToFeature);
    }

    async getFeaturesBy(fields) {
        const rows = await this.db
            .select(FEATURE_COLUMNS)
            .from(TABLE)
            .where(fields);
        return rows.map(this.rowToFeature);
    }

    async count() {
        return this.db
            .count('*')
            .from(TABLE)
            .where({ archived: 0 })
            .then(res => Number(res[0].count));
    }

    async getFeature(name) {
        return this.db
            .first(FEATURE_COLUMNS)
            .from(TABLE)
            .where({ name, archived: 0 })
            .then(this.rowToFeature);
    }

    async hasFeature(name) {
        return this.db
            .first('name', 'archived')
            .from(TABLE)
            .where({ name })
            .then(row => {
                if (!row) {
                    throw new NotFoundError('No feature toggle found');
                }
                return {
                    name: row.name,
                    archived: row.archived === 1,
                };
            });
    }

    async getArchivedFeatures() {
        const rows = await this.db
            .select(FEATURE_COLUMNS)
            .from(TABLE)
            .where({ archived: 1 })
            .orderBy('name', 'asc');
        return rows.map(this.rowToFeature);
    }

    async lastSeenToggles(togleNames) {
        const now = new Date();
        try {
            await this.db(TABLE)
                .whereIn('name', togleNames)
                .update({ last_seen_at: now });
        } catch (err) {
            this.logger.error('Could not update lastSeen, error: ', err);
        }
    }

    rowToFeature(row) {
        if (!row) {
            throw new NotFoundError('No feature toggle found');
        }
        return {
            name: row.name,
            description: row.description,
            type: row.type,
            project: row.project,
            enabled: row.enabled > 0,
            stale: row.stale,
            strategies: row.strategies,
            variants: row.variants,
            createdAt: row.created_at,
            lastSeenAt: row.last_seen_at,
        };
    }

    eventDataToRow(data) {
        return {
            name: data.name,
            description: data.description,
            type: data.type,
            project: data.project,
            enabled: data.enabled ? 1 : 0,
            stale: data.stale,
            archived: data.archived ? 1 : 0,
            strategies: JSON.stringify(data.strategies),
            variants: data.variants ? JSON.stringify(data.variants) : null,
            created_at: data.createdAt, // eslint-disable-line
        };
    }

    async createFeature(data) {
        try {
            const row = await this.db(TABLE)
                .insert(this.eventDataToRow(data))
                .returning(FEATURE_COLUMNS);

            return this.rowToFeature(row[0]);
        } catch (err) {
            this.logger.error('Could not insert feature, error: ', err);
        }
        return null;
    }

    async updateFeature(data) {
        try {
            await this.db(TABLE)
                .where({ name: data.name })
                .update(this.eventDataToRow(data));
        } catch (err) {
            this.logger.error('Could not update feature, error: ', err);
        }
    }

    async archiveFeature(name) {
        try {
            await this.db(TABLE)
                .where({ name })
                .update({ archived: 1, enabled: 0 });
        } catch (err) {
            this.logger.error('Could not archive feature, error: ', err);
        }
    }

    async reviveFeature({ name }) {
        try {
            await this.db(TABLE)
                .where({ name })
                .update({ archived: 0, enabled: 0 });
        } catch (err) {
            this.logger.error('Could not archive feature, error: ', err);
        }
    }

    async importFeature(data) {
        const rowData = this.eventDataToRow(data);
        try {
            const result = await this.db(TABLE)
                .where({ name: rowData.name })
                .update(rowData);

            if (result === 0) {
                await this.db(TABLE).insert(rowData);
            }
        } catch (err) {
            this.logger.error('Could not import feature, error: ', err);
        }
    }

    async dropFeatures() {
        try {
            await this.db(TABLE).delete();
        } catch (err) {
            this.logger.error('Could not drop features, error: ', err);
        }
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

    async tagFeature(featureName, tag) {
        const stopTimer = this.timer('tagFeature');
        await this.db(FEATURE_TAG_TABLE)
            .insert(this.featureAndTagToRow(featureName, tag))
            .catch(err => {
                if (err.code === UNIQUE_CONSTRAINT_VIOLATION) {
                    throw new FeatureHasTagError(
                        `${featureName} already had the tag: [${tag.type}:${tag.value}]`,
                    );
                } else {
                    throw err;
                }
            });
        stopTimer();
        return tag;
    }

    async untagFeature(featureName, tag) {
        const stopTimer = this.timer('untagFeature');
        try {
            await this.db(FEATURE_TAG_TABLE)
                .where(this.featureAndTagToRow(featureName, tag))
                .delete();
        } catch (err) {
            this.logger.error(err);
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

    featureAndTagToRow(featureName, { type, value }) {
        return {
            feature_name: featureName,
            tag_type: type,
            tag_value: value,
        };
    }
}

module.exports = FeatureToggleStore;
