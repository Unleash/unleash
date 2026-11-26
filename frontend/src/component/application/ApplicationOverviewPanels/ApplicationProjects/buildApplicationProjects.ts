import {
    ALL_PROJECTS,
    type IApplicationEnvironment,
} from '../buildApplicationEnvironments.ts';

export interface IApplicationProject {
    name: string;
    linkedEnvironments: string[];
    coveredEnvironments: string[];
    observedEnvironments: string[];
    observed: boolean;
}

type ProjectEnvironment = Pick<
    IApplicationEnvironment,
    'name' | 'linkedProjects' | 'observedProjects'
>;

const byName = (a: string, b: string) => {
    if (a === ALL_PROJECTS) return -1;
    if (b === ALL_PROJECTS) return 1;
    return a.localeCompare(b);
};

export const buildApplicationProjects = (
    environments: ProjectEnvironment[],
    observedProjects: string[],
): IApplicationProject[] => {
    const observed = new Set(observedProjects);
    const namesWhere = (matches: (e: ProjectEnvironment) => boolean) =>
        environments.filter(matches).map((environment) => environment.name);
    const coveredEnvironments = namesWhere((e) =>
        e.linkedProjects.includes(ALL_PROJECTS),
    );

    return [
        ...new Set([
            ...environments.flatMap((e) => e.linkedProjects),
            ...observed,
        ]),
    ]
        .sort(byName)
        .map((name) => ({
            name,
            linkedEnvironments: namesWhere((e) =>
                e.linkedProjects.includes(name),
            ),
            coveredEnvironments:
                name === ALL_PROJECTS ? [] : coveredEnvironments,
            observedEnvironments: namesWhere((e) =>
                e.observedProjects.includes(name),
            ),
            observed: observed.has(name),
        }));
};
