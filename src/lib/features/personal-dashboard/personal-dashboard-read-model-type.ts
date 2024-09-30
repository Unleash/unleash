import type { ProjectOwners } from '../project/project-owners-read-model.type';

export type PersonalFeature = { name: string; type: string; project: string };
export type BasePersonalProject = {
    name: string;
    id: string;
    roles?: {
        name: string;
        id: number;
        type: 'custom' | 'project' | 'root' | 'custom-root';
    }[];
};
export type PersonalProject = BasePersonalProject & {
    owners?: ProjectOwners;
} & {
    health: number;
    memberCount: number;
    featureCount: number;
};

export interface IPersonalDashboardReadModel {
    getPersonalFeatures(userId: number): Promise<PersonalFeature[]>;
    getPersonalProjects(userId: number): Promise<BasePersonalProject[]>;
}
