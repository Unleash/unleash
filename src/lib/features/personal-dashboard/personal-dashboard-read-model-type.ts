import type { ProjectOwners } from '../project/project-owners-read-model.type';

export type PersonalFeature = { name: string; type: string; project: string };
export type PersonalProject = {
    name: string;
    id: string;
    roles: {
        name: string;
        id: number;
        type: 'custom' | 'project' | 'root' | 'custom-root';
    }[];
    owners: ProjectOwners;
};

export interface IPersonalDashboardReadModel {
    getPersonalFeatures(userId: number): Promise<PersonalFeature[]>;
    getPersonalProjects(userId: number): Promise<PersonalProject[]>;
}
