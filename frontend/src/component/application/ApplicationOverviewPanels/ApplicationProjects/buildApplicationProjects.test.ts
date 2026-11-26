import { expect, test } from 'vitest';
import { buildApplicationProjects } from './buildApplicationProjects.ts';

const environment = (
    name: string,
    linkedProjects: string[],
    observedProjects: string[] = [],
) => ({ name, linkedProjects, observedProjects });

test('a project is linked per environment and observed for the whole application', () => {
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
            name: 'dx',
            linkedEnvironments: ['staging', 'production'],
            observedEnvironments: [],
            observed: true,
        },
        {
            name: 'eg',
            linkedEnvironments: ['staging', 'production'],
            observedEnvironments: [],
            observed: false,
        },
        // only seen in metrics; the all-projects token still reads it
        {
            name: 'sa',
            linkedEnvironments: ['staging'],
            observedEnvironments: [],
            observed: true,
        },
    ]);
});

test('an all-projects token alone lists no project', () => {
    expect(
        buildApplicationProjects([environment('production', ['*'])], []),
    ).toEqual([]);
});
