import type { ProjectAccess } from '../private-project/privateProjectStore.js';
import type {
    FlagCreator,
    FlagCreatorsSearchOptions,
    FlagCreatorsSearchResult,
    IProjectFlagCreatorsReadModel,
} from './project-flag-creators-read-model.type.js';

export class FakeProjectFlagCreatorsReadModel
    implements IProjectFlagCreatorsReadModel
{
    async getFlagCreators(_project: string): Promise<FlagCreator[]> {
        return [];
    }

    async getFlagCreatorsAcrossProjects(
        _accessibleProjects: ProjectAccess,
        _options: FlagCreatorsSearchOptions,
    ): Promise<FlagCreatorsSearchResult> {
        return { flagCreators: [], total: 0 };
    }
}
