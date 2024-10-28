import type { IUnleashStores } from '../../types/stores';

import type { Logger } from '../../logger';
import type { IUnleashConfig } from '../../types/option';
import type EventService from '../events/event-service';
import {
    type IAuditUser,
    UserSettingsUpdatedEvent,
    type IUserStore,
} from '../../types';
import type { UserSettingsSchema } from '../../openapi/spec/user-settings-schema';

export class UserSettingsService {
    private userStore: IUserStore;

    private eventService: EventService;

    private logger: Logger;

    constructor(
        { userStore }: Pick<IUnleashStores, 'userStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        eventService: EventService,
    ) {
        this.userStore = userStore;
        this.eventService = eventService;
        this.logger = getLogger('services/user-settings-service.js');
    }

    async getAll(userId: number): Promise<UserSettingsSchema['settings']> {
        return this.userStore.getSettings(userId);
    }

    async set(
        userId: number,
        param: string,
        value: string,
        auditUser: IAuditUser,
    ) {
        await this.userStore.setSettings(userId, { [param]: value });
        await this.eventService.storeEvent(
            new UserSettingsUpdatedEvent({
                auditUser,
                data: { userId, param, value },
            }),
        );
    }
}
