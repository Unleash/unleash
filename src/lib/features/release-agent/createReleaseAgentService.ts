import type { Db } from '../../db/db.js';
import type { IUnleashConfig } from '../../types/index.js';
import { FakeScheduledActionStore } from '../../../test/fixtures/fake-scheduled-action-store.js';
import { FakeScheduledSequenceStore } from '../../../test/fixtures/fake-scheduled-sequence-store.js';
import {
    ReleaseAgentService,
    type ReleaseAgentServiceOptions,
} from './release-agent-service.js';
import { ScheduledActionStore } from './scheduled-action-store.js';
import { ScheduledSequenceStore } from './scheduled-sequence-store.js';

export const createReleaseAgentService = (
    db: Db,
    config: IUnleashConfig,
    options: ReleaseAgentServiceOptions = {},
): ReleaseAgentService => {
    const scheduledSequenceStore = new ScheduledSequenceStore(db, {
        eventBus: config.eventBus,
    });
    const scheduledActionStore = new ScheduledActionStore(db, {
        eventBus: config.eventBus,
    });
    return new ReleaseAgentService(
        { scheduledSequenceStore, scheduledActionStore },
        config,
        options,
    );
};

export const createFakeReleaseAgentService = (
    config: IUnleashConfig,
    options: ReleaseAgentServiceOptions = {},
) => {
    const scheduledSequenceStore = new FakeScheduledSequenceStore();
    const scheduledActionStore = new FakeScheduledActionStore();
    const releaseAgentService = new ReleaseAgentService(
        { scheduledSequenceStore, scheduledActionStore },
        config,
        options,
    );
    return {
        scheduledSequenceStore,
        scheduledActionStore,
        releaseAgentService,
    };
};
