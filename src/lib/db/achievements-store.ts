import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import { IAchievementsStore } from '../types/stores/achievements-store';
import { IAchievement, IAchievementUnlock } from '../types/models/achievement';
import { Achievement, Achievements } from '../constants/achievements';

const TABLE = 'user_achievements';

const fromRow = (row): IAchievementUnlock => {
    if (!row) {
        return { id: -1 };
    }
    return {
        id: row.id,
        achievementId: row.achievement_id,
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

    async getAll(): Promise<IAchievement[]> {
        const achievementIds = Object.values(Achievement);

        const { rows } = await this.db.raw(
            `SELECT achievement_id, cast(COUNT(*) as decimal) / (SELECT COUNT(*) FROM users) * 100 AS "rarity" FROM user_achievements WHERE achievement_id IN (${achievementIds
                .map(() => '?')
                .join(',')}) GROUP BY achievement_id`,
            achievementIds,
        );

        return Achievements.map((achievement) => {
            const rarity = rows.find(
                (row) => row.achievement_id === achievement.id,
            );

            return {
                ...achievement,
                rarity: rarity ? parseFloat(rarity.rarity).toFixed(1) : '0',
            };
        });
    }

    async getUnlocks(userId: number): Promise<IAchievementUnlock[]> {
        const achievements = await this.db
            .select('*')
            .from(TABLE)
            .where('user_id', userId);
        return achievements.map(fromRow);
    }

    async unlock(
        achievementId: Achievement,
        userId: number,
    ): Promise<IAchievementUnlock> {
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
