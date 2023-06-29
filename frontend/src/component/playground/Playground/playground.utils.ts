import {
    PlaygroundResponseSchema,
    AdvancedPlaygroundResponseSchema,
} from 'openapi';
import { IEnvironment } from 'interfaces/environments';
import { ensureArray } from '@server/util/ensureArray';

export const resolveProjects = (
    projects: string[] | string
): string[] | '*' => {
    if (
        !projects ||
        projects.length === 0 ||
        (projects.length === 1 && projects[0] === '*')
    ) {
        return '*';
    }

    return ensureArray(projects);
};

export const resolveEnvironments = (
    envrironments: string[] | string
): string[] => {
    return ensureArray(envrironments);
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
    results:
        | PlaygroundResponseSchema
        | AdvancedPlaygroundResponseSchema
        | undefined
) => {
    if (matches) {
        return '100%';
    }

    if (results && !matches) {
        return '60%';
    }

    return '50%';
};

export const isStringOrStringArray = (
    value: unknown
): value is string | string[] => {
    if (typeof value === 'string') {
        return true;
    }

    if (Array.isArray(value)) {
        return value.every(item => typeof item === 'string');
    }

    return false;
};
