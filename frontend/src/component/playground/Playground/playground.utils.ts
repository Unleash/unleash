import { PlaygroundResponseSchema } from 'component/playground/Playground/interfaces/playground.model';
import { IEnvironment } from 'interfaces/environments';

export const resolveProjects = (
    projects: string[] | string
): string[] | string => {
    return !projects ||
        projects.length === 0 ||
        (projects.length === 1 && projects[0] === '*')
        ? '*'
        : projects;
};

export const resolveDefaultEnvironment = (
    environmentOptions: IEnvironment[]
) => {
    const options = getEnvironmentOptions(environmentOptions);
    if (options.length > 0) {
        return options[0];
    }
    return '';
};

export const getEnvironmentOptions = (environments: IEnvironment[]) => {
    return environments
        .filter(({ enabled }) => Boolean(enabled))
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(({ name }) => name);
};

export const resolveResultsWidth = (
    matches: boolean,
    results: PlaygroundResponseSchema | undefined
) => {
    if (matches) {
        return '100%';
    }

    if (results && !matches) {
        return '65%';
    }

    return '50%';
};
