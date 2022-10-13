import { IUnleashConfig, IUnleashStores } from '../types';
import { Logger } from '../logger';
import { IAchievementsStore } from '../types/stores/achievements-store';
import { IEventStore } from '../types/stores/event-store';
import { ACHIEVEMENT_UNLOCKED } from '../types/events';
import { IAchievement } from '../types/models/achievement';
import User from '../types/user';
import { Achievement } from '../achievements';

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

    async getAll(user: User): Promise<IAchievement[]> {
        return this.achievementsStore.getAllByUser(user.id);
    }

    async unlockAchievement(
        achievement: Achievement,
        user: User,
    ): Promise<void> {
        await this.achievementsStore.unlock(achievement, user.id);

        await this.eventStore.store({
            type: ACHIEVEMENT_UNLOCKED,
            createdBy: user.email || user.username,
        });
    }

    async markAchievementSeen(id: number, user: User): Promise<void> {
        await this.achievementsStore.markAsSeen(id, user.id);
    }
}

module.exports = AchievementsService;
