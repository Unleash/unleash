import {
    ALL_PROJECTS,
    type IApplicationEnvironment,
    canReadProject,
} from '../buildApplicationEnvironments.ts';

export interface IApplicationProject {
    name: string;
    linkedEnvironments: string[];
    observedEnvironments: string[];
    observed: boolean;
}

type ProjectEnvironment = Pick<
    IApplicationEnvironment,
    'name' | 'linkedProjects' | 'observedProjects'
>;

export const buildApplicationProjects = (
    environments: ProjectEnvironment[],
    observedProjects: string[],
): IApplicationProject[] => {
    const observed = new Set(observedProjects);
    const namesOf = (matching: ProjectEnvironment[]) =>
        matching.map((environment) => environment.name);

    return [
        ...new Set([
            ...environments.flatMap((e) => e.linkedProjects),
            ...observed,
        ]),
    ]
        .filter((name) => name !== ALL_PROJECTS)
        .sort((a, b) => a.localeCompare(b))
        .map((name) => ({
            name,
            linkedEnvironments: namesOf(
                environments.filter((e) => canReadProject(e, name)),
            ),
            observedEnvironments: namesOf(
                environments.filter((e) => e.observedProjects.includes(name)),
            ),
            observed: observed.has(name),
        }));
};
