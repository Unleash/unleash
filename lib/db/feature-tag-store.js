'use strict';

const metricsHelper = require('../metrics-helper');
const { DB_TIME } = require('../events');

const FEATURE_TAG_COLUMNS = ['feature_name', 'tag_type', 'tag_value'];
const FEATURE_TAG_TABLE = 'feature_tag';

class FeatureTagStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.logger = getLogger('feature-tag-store.js');

        this.timer = action =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'tag',
                action,
            });
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
            .onConflict(['feature_name', 'tag_type', 'tag_value'])
            .ignore();
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

module.exports = FeatureTagStore;
