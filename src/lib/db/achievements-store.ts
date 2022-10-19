import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import { IAchievementsStore } from '../types/stores/achievements-store';
import { IAchievement } from '../types/models/achievement';

const TABLE = 'user_achievements';

const fromRow = (row): IAchievement => {
    if (!row) {
        return {
            id: -1,
            achievementId: '__ALREADY_UNLOCKED__',
        };
    }
    return {
        id: row.id,
        achievementId: row.achievement_id,
        rarity: '', // TODO: We have this info, just need to query it: "x% of users have this achievement"
        unlockedAt: row.unlocked_at,
        seenAt: row.seen_at,
    };
};

export default class AchievementsStore implements IAchievementsStore {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('achievements-store.ts');
    }

    async getAllByUser(userId: number): Promise<IAchievement[]> {
        const achievements = await this.db
            .select('*')
            .from(TABLE)
            .where('user_id', userId);
        return achievements.map(fromRow);
    }

    async unlock(achievementId: string, userId: number): Promise<IAchievement> {
        // TODO: We might want to add some kind of server-side check here to avoid cheating
        // e.g. "FIRST_TOGGLE" could run a query to see if the user has at least one toggle
        // could exist as a mapping file on the server-side that maps achievementId to a query to be run in the context of the user

        // TODO: Check if this is the right way to guard against duplicate achievements
        // Would be nice to convert to knex syntax
        const { rows } = await this.db.raw(
            `INSERT INTO ${TABLE} (achievement_id, user_id) SELECT :achievement_id, :user_id WHERE NOT EXISTS(SELECT 1 FROM ${TABLE} WHERE achievement_id = :achievement_id AND user_id = :user_id) RETURNING *`,
            {
                achievement_id: achievementId,
                user_id: userId,
            },
        );

        return fromRow(rows[0]);
    }

    async markAsSeen(id: number, userId: number): Promise<void> {
        await this.db(TABLE)
            .where({ id: id, user_id: userId })
            .update({ seen_at: new Date() });
    }
}
