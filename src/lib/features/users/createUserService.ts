import { ResetTokenStore } from '../../db/reset-token-store.js';
import SettingStore from '../../db/setting-store.js';
import {
    createAccessService,
    createEventsService,
    type Db,
    EmailService,
    type IUnleashConfig,
    ResetTokenService,
    SessionService,
    SessionStore,
    SettingService,
    UserService,
} from '../../server-impl.js';
import { UserStore } from './user-store.js';

export const createUserService = (
    db: Db,
    config: IUnleashConfig,
): UserService => {
    const userStore = new UserStore(db, config.getLogger);
    const resetTokenStore = new ResetTokenStore(
        db,
        config.eventBus,
        config.getLogger,
    );
    const resetTokenService = new ResetTokenService(
        { resetTokenStore },
        config,
    );
    const eventService = createEventsService(db, config);
    const sessionStore = new SessionStore(
        db,
        config.eventBus,
        config.getLogger,
    );
    const sessionService = new SessionService({ sessionStore }, config);
    const settingStore = new SettingStore(db, config.getLogger);
    const settingService = new SettingService(
        { settingStore },
        config,
        eventService,
    );
    const accessService = createAccessService(db, config);
    const emailService = new EmailService(config);

    return new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });
};
