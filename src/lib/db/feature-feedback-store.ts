import { Db } from './db';
import { IFeatureFeedbackStore } from '../types/stores/feature-feedback-store';
import { IFeatureFeedback } from '../types';
import NotFoundError from '../error/notfound-error';

const COLUMNS = [
    'id',
    'feature_name',
    'context_hash',
    'payload',
    'metadata',
    'created_at',
];

const TABLE = 'feature_feedback';

interface IFeatureFeedbackTable {
    id: number;
    feature_name: string;
    context_hash: string;
    payload: string;
    metadata: object;
    created_at: Date;
}

function mapRow(row: IFeatureFeedbackTable): IFeatureFeedback {
    return {
        id: row.id,
        contextHash: row.context_hash,
        createdAt: row.created_at,
        featureName: row.feature_name,
        metadata: row.metadata,
        payload: row.payload,
    };
}

class FeatureFeedbackStore implements IFeatureFeedbackStore {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async createFeatureFeedback(
        feedback: Omit<IFeatureFeedback, 'id' | 'createdAt'>,
    ): Promise<IFeatureFeedback> {
        const rows = await this.db(TABLE)
            .insert({
                context_hash: feedback.contextHash,
                feature_name: feedback.featureName,
                metadata: feedback.metadata,
                payload: feedback.payload,
            })
            .returning('*');
        return mapRow(rows[0]);
    }

    async getFeedbackForFeature(
        featureName: string,
    ): Promise<IFeatureFeedback[]> {
        const rows = await this.db<IFeatureFeedbackTable>(TABLE).where({
            feature_name: featureName,
        });
        return rows.map(mapRow);
    }

    async get(id: number): Promise<IFeatureFeedback> {
        const row = await this.db(TABLE).where({ id }).first();

        if (!row) {
            throw new NotFoundError(`Could not find feedback with id=${id}`);
        }

        return mapRow(row);
    }

    async getAll(): Promise<IFeatureFeedback[]> {
        const rows = await this.db
            .select(COLUMNS)
            .from<IFeatureFeedbackTable>(TABLE);

        return rows.map(mapRow);
    }

    async exists(id: number): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        return present;
    }

    async delete(id: number): Promise<void> {
        await this.db(TABLE).where({ id }).del();
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).delete();
    }

    destroy(): void {}
}

module.exports = FeatureFeedbackStore;
export default FeatureFeedbackStore;
