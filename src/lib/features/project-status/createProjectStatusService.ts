import type { Db, IUnleashConfig } from '../../server-impl';
import { ProjectStatusService } from './project-status-service';
import EventStore from '../events/event-store';
import FakeEventStore from '../../../test/fixtures/fake-event-store';
import ProjectStore from '../project/project-store';
import FakeProjectStore from '../../../test/fixtures/fake-project-store';

export const createProjectStatusService = (
    db: Db,
    config: IUnleashConfig,
): ProjectStatusService => {
    const eventStore = new EventStore(db, config.getLogger);
    const projectStore = new ProjectStore(
        db,
        config.eventBus,
        config.getLogger,
        config.flagResolver,
    );
    return new ProjectStatusService({ eventStore, projectStore });
};

export const createFakeProjectStatusService = () => {
    const eventStore = new FakeEventStore();
    const projectStore = new FakeProjectStore();
    const projectStatusService = new ProjectStatusService({
        eventStore,
        projectStore,
    });

    return {
        projectStatusService,
    };
};
