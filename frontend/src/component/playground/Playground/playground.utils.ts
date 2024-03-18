import type {
    PlaygroundResponseSchema,
    AdvancedPlaygroundResponseSchema,
} from 'openapi';
import type { IEnvironment } from 'interfaces/environments';
import { ensureArray } from '@server/util/ensureArray';

export const resolveProjects = (
    projects: string[] | string,
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
    envrironments: string[] | string,
): string[] => {
    return ensureArray(envrironments);
};

export const resolveDefaultEnvironment = (
    environmentOptions: IEnvironment[],
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
        | undefined,
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
    value: unknown,
): value is string | string[] => {
    if (typeof value === 'string') {
        return true;
    }

    if (Array.isArray(value)) {
        return value.every((item) => typeof item === 'string');
    }

    return false;
};

type InputContextProperties = {
    appName?: string;
    environment?: string;
    userId?: string;
    sessionId?: string;
    remoteAddress?: string;
    currentTime?: string;
    properties?: { [key: string]: any };
    [key: string]: any;
};

export type NormalizedContextProperties = Omit<
    InputContextProperties,
    'properties'
> & {
    properties?: { [key: string]: any };
};

export const normalizeCustomContextProperties = (
    input: InputContextProperties,
): NormalizedContextProperties => {
    const standardProps = new Set([
        'appName',
        'environment',
        'userId',
        'sessionId',
        'remoteAddress',
        'currentTime',
        'properties',
    ]);

    const output: InputContextProperties = { ...input };
    let hasCustomProperties = false;

    for (const key in input) {
        if (!standardProps.has(key)) {
            if (!output.properties) {
                output.properties = {};
            }
            output.properties[key] = input[key];
            delete output[key];
            hasCustomProperties = true;
        }
    }

    if (!hasCustomProperties && !input.properties) {
        delete output.properties;
    }

    return output;
};

export const validateTokenFormat = (token: string): void => {
    const [projectEnvAccess] = token.split('.');
    const [project, environment] = projectEnvAccess.split(':');
    if (!project || !environment) {
        throw new Error('Invalid token format');
    }

    if (environment === '*') {
        throw new Error('Admin tokens are not supported in the playground');
    }
};

export const extractProjectEnvironmentFromToken = (token: string) => {
    const [projectEnvAccess] = token.split('.');
    return projectEnvAccess.split(':');
};
