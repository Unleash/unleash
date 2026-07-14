import type { ProjectAccess } from '../private-project/privateProjectStore.js';

export type FlagCreator = { id: number; name: string };

export type FlagCreatorsSearchResult = {
    flagCreators: FlagCreator[];
    total: number;
};

export type FlagCreatorsSearchOptions = {
    query?: string;
    limit: number;
    offset: number;
};

export interface IProjectFlagCreatorsReadModel {
    getFlagCreators(project: string): Promise<FlagCreator[]>;
    getFlagCreatorsAcrossProjects(
        accessibleProjects: ProjectAccess,
        options: FlagCreatorsSearchOptions,
    ): Promise<FlagCreatorsSearchResult>;
}
