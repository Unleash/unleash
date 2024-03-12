import type { FromSchema } from 'json-schema-to-ts';

export const versionSchema = {
    $id: '#/components/schemas/versionSchema',
    type: 'object',
    additionalProperties: false,
    description: 'Detailed information about an Unleash version',
    required: ['current', 'latest', 'isLatest'],
    properties: {
        current: {
            type: 'object',
            additionalProperties: false,
            description: 'The current version of Unleash.',
            properties: {
                oss: {
                    description:
                        'The OSS version used when building this Unleash instance, represented as a git revision belonging to the [main Unleash git repo](https://github.com/Unleash/unleash/)',
                    example: '5.3.0-main',
                    type: 'string',
                },
                enterprise: {
                    description:
                        'The Enterpris version of Unleash used to build this instance, represented as a git revision belonging to the [Unleash Enterprise](https://github.com/ivarconr/unleash-enterprise) repository. Will be an empty string if no enterprise version was used,',
                    example: '5.3.0-main+2105.45ed03c9',
                    type: 'string',
                },
            },
        },
        latest: {
            type: 'object',
            additionalProperties: false,
            description:
                'Information about the latest available Unleash releases. Will be an empty object if no data is available.',
            properties: {
                oss: {
                    description: 'The latest available OSS version of Unleash',
                    type: 'string',
                    example: '5.1.5',
                },
                enterprise: {
                    description:
                        'The latest available Enterprise version of Unleash',
                    type: 'string',
                    example: '5.1.5',
                },
            },
        },
        isLatest: {
            type: 'boolean',
            description:
                'Whether the Unleash server is running the latest release (`true`) or if there are updates available (`false`)',
            example: true,
        },
        instanceId: {
            type: 'string',
            description: 'The instance identifier of the Unleash instance',
            example: '0d652a82-43db-4144-8e02-864b0b030710',
        },
    },
    components: {},
} as const;

export type VersionSchema = FromSchema<typeof versionSchema>;
