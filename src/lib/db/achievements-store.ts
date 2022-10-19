import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import { IAchievementsStore } from '../types/stores/achievements-store';
import { IAchievement } from '../types/models/achievement';
import { Achievement, Achievements } from '../constants/achievements';
import NotFoundError from '../error/notfound-error';

const TABLE = 'user_achievements';

const fromRow = (row): IAchievement => {
    if (!row) {
        return { id: -1 };
    }

    const achievement = Achievements[row.achievement_id];

    if (!achievement) {
        throw new NotFoundError(
            `No achievement found for id: ${row.achievement_id}`,
        );
    }

    const { title, description, imageUrl } = achievement;

    return {
        id: row.id,
        achievementId: row.achievement_id,
        title,
        description,
        rarity: '', // TODO: We have this info, just need to query it: "x% of users have this achievement"
        imageUrl,
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

    async unlock(
        achievementId: Achievement,
        userId: number,
    ): Promise<IAchievement> {
        // TODO: We might want to add some kind of server-side check here to avoid cheating
        // e.g. "FIRST_TOGGLE" could run a query to see if the user has at least one toggle
        // could exist as a server-side property to be run in the context of the user

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
