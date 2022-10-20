import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import { IAchievementsStore } from '../types/stores/achievements-store';
import { IAchievement } from '../types/models/achievement';
import {
    Achievement,
    AchievementDefinitions,
    Achievements,
} from '../constants/achievements';
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
        rarity: row.rarity ? parseFloat(row.rarity).toFixed(1) : '0',
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

    async getDefinitions(): Promise<AchievementDefinitions> {
        const achievements = Achievements;
        const achievementIds = Object.keys(achievements);

        const { rows } = await this.db.raw(
            `SELECT achievement_id, cast(COUNT(*) as decimal) / (SELECT COUNT(*) FROM users) * 100 AS "rarity" FROM user_achievements WHERE achievement_id IN (${achievementIds
                .map(() => '?')
                .join(',')}) GROUP BY achievement_id`,
            achievementIds,
        );

        achievementIds.forEach((achievementId) => {
            const achievement = achievements[achievementId];
            const rarity = rows.find(
                (row) => row.achievement_id === achievementId,
            );

            achievements[achievementId] = {
                ...achievement,
                rarity: rarity ? parseFloat(rarity.rarity).toFixed(1) : '0',
            };
        });

        return achievements;
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
            `INSERT INTO ${TABLE} (achievement_id, user_id) SELECT :achievement_id, :user_id WHERE NOT EXISTS(SELECT 1 FROM ${TABLE} WHERE achievement_id = :achievement_id AND user_id = :user_id) RETURNING *, (SELECT cast(COUNT(*)+1 as decimal) / (SELECT COUNT(*) FROM users) * 100 FROM user_achievements WHERE ACHIEVEMENT_ID = :achievement_id) AS "rarity"`,
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
