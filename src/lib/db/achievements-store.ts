import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import { IAchievementsStore } from '../types/stores/achievements-store';
import { IAchievement } from '../types/models/achievement';
import NotFoundError from '../error/notfound-error';
import { Achievement, Achievements } from '../achievements';

const TABLE = 'user_achievements';

const fromRow = (row): IAchievement => {
    if (!row) {
        throw new NotFoundError('No achievement found');
    }
    const achievement = Achievements[row.achievement_id];
    if (!achievement) {
        throw new NotFoundError(
            `No achievement found for id: ${row.achievement_id}`,
        );
    }
    return {
        id: row.id,
        title: achievement.title,
        description: achievement.description,
        rarity: '', // TODO: We have this info, just need to query it: "x% of users have this achievement"
        imageUrl: achievement.imageUrl,
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

    async unlock(achievement: Achievement, userId: number): Promise<void> {
        // TODO: Check if this is the right way to do this
        await this.db.raw(
            `INSERT INTO ${TABLE} (achievement_id, user_id) SELECT :achievement_id, :user_id WHERE NOT EXISTS(SELECT 1 FROM ${TABLE} WHERE achievement_id = :achievement_id AND user_id = :user_id)`,
            {
                achievement_id: achievement.id,
                user_id: userId,
            },
        );
    }

    async markAsSeen(id: number, userId: number): Promise<void> {
        await this.db(TABLE)
            .where({ id: id, user_id: userId })
            .update({ seen_at: new Date() });
    }
}
