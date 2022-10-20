import { IUnleashConfig, IUnleashStores } from '../types';
import { Logger } from '../logger';
import { IAchievementsStore } from '../types/stores/achievements-store';
import { IEventStore } from '../types/stores/event-store';
import { ACHIEVEMENT_UNLOCKED } from '../types/events';
import { IAchievement, IAchievementUnlock } from '../types/models/achievement';
import User from '../types/user';
import { Achievement } from '../constants/achievements';

export default class AchievementsService {
    private config: IUnleashConfig;

    private logger: Logger;

    private achievementsStore: IAchievementsStore;

    private eventStore: IEventStore;

    constructor(
        {
            achievementsStore,
            eventStore,
        }: Pick<IUnleashStores, 'achievementsStore' | 'eventStore'>,
        config: IUnleashConfig,
    ) {
        this.config = config;
        this.logger = config.getLogger('services/achievements-service.ts');
        this.achievementsStore = achievementsStore;
        this.eventStore = eventStore;
    }

    async getAll(): Promise<IAchievement[]> {
        return this.achievementsStore.getAll();
    }

    async getUnlocks(user: User): Promise<IAchievementUnlock[]> {
        return this.achievementsStore.getUnlocks(user.id);
    }

    async unlockAchievement(
        achievementId: Achievement,
        user: User,
    ): Promise<IAchievementUnlock> {
        const newAchievement = await this.achievementsStore.unlock(
            achievementId,
            user.id,
        );

        await this.eventStore.store({
            type: ACHIEVEMENT_UNLOCKED,
            createdBy: user.email || user.username,
        });

        return newAchievement;
    }

    async markAchievementSeen(id: number, user: User): Promise<void> {
        await this.achievementsStore.markAsSeen(id, user.id);
    }
}

module.exports = AchievementsService;
