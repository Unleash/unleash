import type { IProjectFlagCreatorsReadModel } from './project-flag-creators-read-model.type.js';

export class FakeProjectFlagCreatorsReadModel
    implements IProjectFlagCreatorsReadModel
{
    async getFlagCreators(
        project: string,
    ): Promise<{ id: number; name: string }[]> {
        return [];
    }
}
