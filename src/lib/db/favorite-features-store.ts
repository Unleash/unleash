import EventEmitter from 'events';
import { IFavoriteFeaturesStore } from '../types';
import { Logger, LogProvider } from '../logger';
import { IFavoriteFeatureKey } from '../types/stores/favorite-features';
import { IFavoriteFeature } from '../types/favorites';
import { Db } from './db';

const T = {
    FAVORITE_FEATURES: 'favorite_features',
};

interface IFavoriteFeatureRow {
    user_id: number;
    feature: string;
    created_at: Date;
}

const rowToFavorite = (row: IFavoriteFeatureRow) => {
    return {
        userId: row.user_id,
        feature: row.feature,
        createdAt: row.created_at,
    };
};

export class FavoriteFeaturesStore implements IFavoriteFeaturesStore {
    private logger: Logger;

    private eventBus: EventEmitter;

    private db: Db;

    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.eventBus = eventBus;
        this.logger = getLogger('lib/db/favorites-store.ts');
    }

    async addFavoriteFeature({
        userId,
        feature,
    }: IFavoriteFeatureKey): Promise<IFavoriteFeature> {
        const insertedFeature = await this.db<IFavoriteFeatureRow>(
            T.FAVORITE_FEATURES,
        )
            .insert({ feature, user_id: userId })
            .onConflict(['user_id', 'feature'])
            .merge()
            .returning('*');

        return rowToFavorite(insertedFeature[0]);
    }

    async delete({ userId, feature }: IFavoriteFeatureKey): Promise<void> {
        return this.db(T.FAVORITE_FEATURES)
            .where({ feature, user_id: userId })
            .del();
    }

    async deleteAll(): Promise<void> {
        await this.db(T.FAVORITE_FEATURES).del();
    }

    destroy(): void {}

    async exists({ userId, feature }: IFavoriteFeatureKey): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${T.FAVORITE_FEATURES} WHERE user_id = ? AND feature = ?) AS present`,
            [userId, feature],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get({
        userId,
        feature,
    }: IFavoriteFeatureKey): Promise<IFavoriteFeature> {
        const favorite = await this.db
            .table<IFavoriteFeatureRow>(T.FAVORITE_FEATURES)
            .select()
            .where({ feature, user_id: userId })
            .first();

        return rowToFavorite(favorite);
    }

    async getAll(): Promise<IFavoriteFeature[]> {
        const groups = await this.db<IFavoriteFeatureRow>(
            T.FAVORITE_FEATURES,
        ).select();
        return groups.map(rowToFavorite);
    }
}
