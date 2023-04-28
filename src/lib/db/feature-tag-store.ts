import { Logger, LogProvider } from '../logger';
import { ITag } from '../types';
import EventEmitter from 'events';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import {
    IFeatureAndTag,
    IFeatureTag,
    IFeatureTagStore,
} from '../types/stores/feature-tag-store';
import { Db } from './db';
import NotFoundError from '../error/notfound-error';

const COLUMNS = ['feature_name', 'tag_type', 'tag_value'];
const TABLE = 'feature_tag';

interface FeatureTagTable {
    feature_name: string;
    tag_type: string;
    tag_value: string;
}

class FeatureTagStore implements IFeatureTagStore {
    private db: Db;

    private logger: Logger;

    private readonly timer: Function;

    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('feature-tag-store.ts');
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'feature-toggle',
                action,
            });
    }

    async delete({
        featureName,
        tagType,
        tagValue,
    }: IFeatureTag): Promise<void> {
        await this.db(TABLE)
            .where({
                feature_name: featureName,
                tag_type: tagType,
                tag_value: tagValue,
            })
            .del();
    }

    destroy(): void {}

    async exists({
        featureName,
        tagType,
        tagValue,
    }: IFeatureTag): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE feature_name = ? AND tag_type = ? AND tag_value = ?) AS present`,
            [featureName, tagType, tagValue],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get({
        featureName,
        tagType,
        tagValue,
    }: IFeatureTag): Promise<IFeatureTag> {
        const row = await this.db(TABLE)
            .where({
                feature_name: featureName,
                tag_type: tagType,
                tag_value: tagValue,
            })
            .first();
        return {
            featureName: row.feature_name,
            tagType: row.tag_type,
            tagValue: row.tag_value,
        };
    }

    async getAll(): Promise<IFeatureTag[]> {
        const rows = await this.db(TABLE).select(COLUMNS);
        return rows.map((row) => ({
            featureName: row.feature_name,
            tagType: row.tag_type,
            tagValue: row.tag_value,
        }));
    }

    async getAllTagsForFeature(featureName: string): Promise<ITag[]> {
        const stopTimer = this.timer('getAllForFeature');
        if (await this.featureExists(featureName)) {
            const rows = await this.db
                .select(COLUMNS)
                .from<FeatureTagTable>(TABLE)
                .where({ feature_name: featureName });
            stopTimer();
            return rows.map(this.featureTagRowToTag);
        } else {
            throw new NotFoundError(
                `Could not find feature with name ${featureName}`,
            );
        }
    }

    async getAllFeaturesForTag(tagValue: string): Promise<string[]> {
        const rows = await this.db
            .select('feature_name')
            .from<FeatureTagTable>(TABLE)
            .where({ tag_value: tagValue });
        return rows.map(({ feature_name }) => feature_name);
    }

    async featureExists(featureName: string): Promise<boolean> {
        const result = await this.db.raw(
            'SELECT EXISTS (SELECT 1 FROM features WHERE name = ?) AS present',
            [featureName],
        );
        const { present } = result.rows[0];
        return present;
    }

    async getAllByFeatures(features: string[]): Promise<IFeatureTag[]> {
        const query = this.db
            .select(COLUMNS)
            .from<FeatureTagTable>(TABLE)
            .whereIn('feature_name', features)
            .orderBy('feature_name', 'asc');
        const rows = await query;
        return rows.map((row) => ({
            featureName: row.feature_name,
            tagType: row.tag_type,
            tagValue: row.tag_value,
        }));
    }

    async tagFeature(featureName: string, tag: ITag): Promise<ITag> {
        const stopTimer = this.timer('tagFeature');
        await this.db<FeatureTagTable>(TABLE)
            .insert(this.featureAndTagToRow(featureName, tag))
            .onConflict(COLUMNS)
            .merge();
        stopTimer();
        return tag;
    }

    async untagFeatures(featureTags: IFeatureTag[]): Promise<void> {
        const stopTimer = this.timer('untagFeatures');
        try {
            await this.db(TABLE)
                .whereIn(COLUMNS, featureTags.map(this.featureTagArray))
                .delete();
        } catch (err) {
            this.logger.error(err);
        }
        stopTimer();
    }

    /**
     * Only gets tags for active feature toggles.
     */
    async getAllFeatureTags(): Promise<IFeatureTag[]> {
        const rows = await this.db(TABLE)
            .select(COLUMNS)
            .whereIn(
                'feature_name',
                this.db('features').where({ archived: false }).select(['name']),
            );
        return rows.map((row) => ({
            featureName: row.feature_name,
            tagType: row.tag_type,
            tagValue: row.tag_value,
        }));
    }

    async deleteAll(): Promise<void> {
        const stopTimer = this.timer('deleteAll');
        await this.db(TABLE).del();
        stopTimer();
    }

    async tagFeatures(featureTags: IFeatureTag[]): Promise<IFeatureAndTag[]> {
        if (featureTags.length !== 0) {
            const rows = await this.db(TABLE)
                .insert(featureTags.map(this.featureTagToRow))
                .returning(COLUMNS)
                .onConflict(COLUMNS)
                .ignore();
            if (rows) {
                return rows.map(this.rowToFeatureAndTag);
            }
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
        return {
            value: row.tag_value,
            type: row.tag_type,
        };
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

    featureTagToRow({
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

    featureTagArray({ featureName, tagType, tagValue }: IFeatureTag): string[] {
        return [featureName, tagType, tagValue];
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
