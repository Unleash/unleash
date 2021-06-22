import { Knex } from 'knex';
import { EventEmitter } from 'stream';
import { Logger, LogProvider } from '../logger';
import { ITag } from '../types/model';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import { UNIQUE_CONSTRAINT_VIOLATION } from '../error/db-error';
import FeatureHasTagError from '../error/feature-has-tag-error';

const COLUMNS = ['feature_name', 'tag_type', 'tag_value'];
const TABLE = 'feature_tag';

interface FeatureTagTable {
    feature_name: string;
    tag_type: string;
    tag_value: string;
}

export interface IFeatureTag {
    featureName: string;
    tagType: string;
    tagValue: string;
}

export interface IFeatureAndTag {
    featureName: string;
    tag: ITag;
}

class FeatureTagStore {
    private db: Knex;

    private logger: Logger;

    private readonly timer: Function;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('feature-tag-store.js');
        this.timer = action =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'feature-toggle',
                action,
            });
    }

    async getAllTagsForFeature(featureName: string): Promise<ITag[]> {
        const stopTimer = this.timer('getAllForFeature');
        const rows = await this.db
            .select(COLUMNS)
            .from<FeatureTagTable>(TABLE)
            .where({ feature_name: featureName });
        stopTimer();
        return rows.map(this.featureTagRowToTag);
    }

    async tagFeature(featureName: string, tag: ITag): Promise<ITag> {
        const stopTimer = this.timer('tagFeature');
        await this.db<FeatureTagTable>(TABLE)
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

    async getAllFeatureTags(): Promise<IFeatureTag[]> {
        const rows = await this.db(TABLE).select(COLUMNS);
        return rows.map(row => ({
            featureName: row.feature_name,
            tagType: row.tag_type,
            tagValue: row.tag_value,
        }));
    }

    async dropFeatureTags(): Promise<void> {
        const stopTimer = this.timer('dropFeatureTags');
        await this.db(TABLE).del();
        stopTimer();
    }

    async importFeatureTags(
        featureTags: IFeatureTag[],
    ): Promise<IFeatureAndTag[]> {
        const rows = await this.db(TABLE)
            .insert(featureTags.map(this.importToRow))
            .returning(COLUMNS)
            .onConflict(COLUMNS)
            .ignore();
        if (rows) {
            return rows.map(this.rowToFeatureAndTag);
        }
        return [];
    }

    async untagFeature(featureName: string, tag: ITag): Promise<void> {
        const stopTimer = this.timer('untagFeature');
        try {
            await this.db(TABLE)
                .where(this.featureAndTagToRow(featureName, tag))
                .delete();
        } catch (err) {
            this.logger.error(err);
        }
        stopTimer();
    }

    featureTagRowToTag(row: FeatureTagTable): ITag {
        if (row) {
            return {
                value: row.tag_value,
                type: row.tag_type,
            };
        }
        return null;
    }

    rowToFeatureAndTag(row: FeatureTagTable): IFeatureAndTag {
        return {
            featureName: row.feature_name,
            tag: {
                type: row.tag_type,
                value: row.tag_value,
            },
        };
    }

    importToRow({
        featureName,
        tagType,
        tagValue,
    }: IFeatureTag): FeatureTagTable {
        return {
            feature_name: featureName,
            tag_type: tagType,
            tag_value: tagValue,
        };
    }

    featureAndTagToRow(
        featureName: string,
        { type, value }: ITag,
    ): FeatureTagTable {
        return {
            feature_name: featureName,
            tag_type: type,
            tag_value: value,
        };
    }
}

module.exports = FeatureTagStore;
export default FeatureTagStore;
