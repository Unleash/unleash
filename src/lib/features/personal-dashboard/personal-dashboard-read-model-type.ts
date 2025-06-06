import type { ProjectOwners } from '../project/project-owners-read-model.type.js';

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
    technicalDebt: number;
    memberCount: number;
    featureCount: number;
    /**
     * @deprecated
     */
    health: number;
};

export interface IPersonalDashboardReadModel {
    getPersonalFeatures(userId: number): Promise<PersonalFeature[]>;
    getPersonalProjects(userId: number): Promise<BasePersonalProject[]>;
    getLatestHealthScores(project: string, count: number): Promise<number[]>;
}
