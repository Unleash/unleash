import type { Db, IUnleashConfig } from '../../server-impl';
import { ProjectStatusService } from './project-status-service';
import EventStore from '../events/event-store';
import FakeEventStore from '../../../test/fixtures/fake-event-store';

export const createProjectStatusService = (
    db: Db,
    config: IUnleashConfig,
): ProjectStatusService => {
    const eventStore = new EventStore(db, config.getLogger);
    return new ProjectStatusService({ eventStore });
};

export const createFakeProjectStatusService = () => {
    const eventStore = new FakeEventStore();
    const projectStatusService = new ProjectStatusService({
        eventStore,
    });

    return {
        projectStatusService,
    };
};
