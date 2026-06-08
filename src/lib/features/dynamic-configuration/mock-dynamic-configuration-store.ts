import type {
    DynamicConfiguration,
    UpsertDynamicConfiguration,
} from './dynamic-configuration-types.js';

const now = '2026-06-08T10:00:00.000Z';

const seedConfigurations = (project: string): DynamicConfiguration[] => [
    {
        key: 'api_timeout_ms',
        project,
        description: 'Timeout used when calling the payment provider.',
        type: 'number',
        validation: {
            minimum: 100,
            maximum: 10_000,
        },
        versions: [
            {
                version: 1,
                value: 5000,
                description: 'Original timeout.',
                createdAt: now,
            },
            {
                version: 2,
                value: 2000,
                description: 'Reduced timeout for interactive applications.',
                createdAt: now,
            },
            {
                version: 3,
                value: 4000,
                createdAt: now,
            },
            {
                version: 4,
                value: 3000,
                createdAt: now,
            },
        ],
        environments: {
            development: {
                defaultVersion: 1,
                overrides: [
                    {
                        id: 'web-app-timeout',
                        priority: 1,
                        constraints: [
                            {
                                contextName: 'appName',
                                operator: 'IN',
                                values: ['web-app'],
                            },
                        ],
                        version: 2,
                    },
                ],
            },
            staging: {
                defaultVersion: 3,
                overrides: [],
            },
            production: {
                defaultVersion: 4,
                overrides: [],
            },
        },
        createdAt: now,
        updatedAt: now,
    },
    {
        key: 'promo_banner',
        project,
        description: 'Presentation settings for the checkout promotion.',
        type: 'json',
        versions: [
            {
                version: 1,
                value: {
                    text: 'Summer sale',
                    show: true,
                },
                createdAt: now,
            },
            {
                version: 2,
                value: {
                    text: 'Summer sale',
                    show: false,
                },
                createdAt: now,
            },
        ],
        environments: {
            development: {
                defaultVersion: 1,
                overrides: [],
            },
            staging: {
                defaultVersion: 1,
                overrides: [],
            },
            production: {
                defaultVersion: 2,
                overrides: [],
            },
        },
        createdAt: now,
        updatedAt: now,
    },
];

const clone = <T>(value: T): T => structuredClone(value);

export class MockDynamicConfigurationStore {
    private readonly configurations = new Map<string, DynamicConfiguration[]>();

    private revision = 1;

    private configurationsFor(project: string): DynamicConfiguration[] {
        const existing = this.configurations.get(project);
        if (existing) {
            return existing;
        }

        const seeded = seedConfigurations(project);
        this.configurations.set(project, seeded);
        return seeded;
    }

    list(project: string): DynamicConfiguration[] {
        return clone(this.configurationsFor(project));
    }

    get(project: string, key: string): DynamicConfiguration | undefined {
        const configuration = this.configurationsFor(project).find(
            (item) => item.key === key,
        );
        return configuration ? clone(configuration) : undefined;
    }

    upsert(
        project: string,
        key: string,
        input: UpsertDynamicConfiguration,
    ): DynamicConfiguration {
        const configurations = this.configurationsFor(project);
        const existingIndex = configurations.findIndex(
            (item) => item.key === key,
        );
        const timestamp = new Date().toISOString();
        const configuration: DynamicConfiguration = {
            ...clone(input),
            versions: input.versions.map((version) => ({
                ...version,
                createdAt: timestamp,
            })),
            key,
            project,
            createdAt:
                existingIndex >= 0
                    ? configurations[existingIndex].createdAt
                    : timestamp,
            updatedAt: timestamp,
        };

        if (existingIndex >= 0) {
            configurations[existingIndex] = configuration;
        } else {
            configurations.push(configuration);
        }
        this.revision += 1;

        return clone(configuration);
    }

    getRevision(): number {
        return this.revision;
    }
}

export const mockDynamicConfigurationStore =
    new MockDynamicConfigurationStore();
