import { expect, test } from 'vitest';
import { buildApplicationProjects } from './buildApplicationProjects.ts';

const environment = (
    name: string,
    linkedProjects: string[],
    observedProjects: string[] = [],
) => ({ name, linkedProjects, observedProjects });

test('lists the all-projects row first, and which environments it covers', () => {
    const projects = buildApplicationProjects(
        [
            environment('development', []),
            environment('staging', ['*']),
            environment('production', ['dx', 'eg']),
        ],
        ['sa', 'dx'],
    );

    expect(projects).toEqual([
        {
            name: '*',
            linkedEnvironments: ['staging'],
            coveredEnvironments: [],
            observedEnvironments: [],
            observed: false,
        },
        {
            name: 'dx',
            linkedEnvironments: ['production'],
            coveredEnvironments: ['staging'],
            observedEnvironments: [],
            observed: true,
        },
        {
            name: 'eg',
            linkedEnvironments: ['production'],
            coveredEnvironments: ['staging'],
            observedEnvironments: [],
            observed: false,
        },
        // only seen in metrics; the all-projects token still reads it
        {
            name: 'sa',
            linkedEnvironments: [],
            coveredEnvironments: ['staging'],
            observedEnvironments: [],
            observed: true,
        },
    ]);
});

test('covers nothing without an all-projects token', () => {
    expect(
        buildApplicationProjects([environment('production', ['dx'])], []),
    ).toEqual([
        {
            name: 'dx',
            linkedEnvironments: ['production'],
            coveredEnvironments: [],
            observedEnvironments: [],
            observed: false,
        },
    ]);
});
