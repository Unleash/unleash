import type { IProjectStaleFlagsReadModel } from './project-stale-flags-read-model-type.js';

export class FakeProjectStaleFlagsReadModel
    implements IProjectStaleFlagsReadModel
{
    async getStaleFlagCountForProject(): Promise<number> {
        return 0;
    }
}
