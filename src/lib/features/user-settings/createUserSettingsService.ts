import type { IUnleashConfig, IUnleashStores } from '../../types';
import type EventService from '../events/event-service';
import { UserSettingsService } from './user-settings-service';

export const createUserSettingsService = (
    stores: Pick<IUnleashStores, 'userStore'>,
    config: Pick<IUnleashConfig, 'getLogger'>,
    eventService: EventService,
): UserSettingsService => {
    return new UserSettingsService(stores, config, eventService);
};
