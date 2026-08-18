import type { Db, IUnleashConfig } from '../../types/index.js';
import type { AccessService } from '../../services/access-service.js';
import { UserAccessLogReadModel } from './user-access-log-read-model.js';
import { FakeUserAccessLogReadModel } from './fake-user-access-log-read-model.js';
import { UserAccessLogService } from './user-access-log-service.js';

export const createUserAccessLogService = (
    db: Db,
    config: IUnleashConfig,
    accessService: AccessService,
): UserAccessLogService => {
    const userAccessLogReadModel = new UserAccessLogReadModel(db);

    return new UserAccessLogService(
        { userAccessLogReadModel },
        { getLogger: config.getLogger },
        { accessService },
    );
};

export const createFakeUserAccessLogService = (
    config: Pick<IUnleashConfig, 'getLogger'>,
    accessService: AccessService,
): UserAccessLogService => {
    const userAccessLogReadModel = new FakeUserAccessLogReadModel();

    return new UserAccessLogService(
        { userAccessLogReadModel },
        { getLogger: config.getLogger },
        { accessService },
    );
};
