import type { FromSchema } from 'json-schema-to-ts';

export const sessionKeepAliveSchema = {
    $id: '#/components/schemas/sessionKeepAliveSchema',
    type: 'object',
    description:
        'What is left of the calling session, as a duration rather than a point in time, so that a wrong clock on the caller cannot matter.',
    additionalProperties: false,
    properties: {
        expiresInMs: {
            type: 'integer',
            minimum: 0,
            description:
                'Milliseconds until the session ends, whichever of the idle window and the maximum age runs out first. Reporting activity moves the idle one; nothing moves the maximum age. Omitted when the instance is enforcing neither, in which case there is nothing to count down to.',
            example: 900000,
        },
    },
    components: {},
} as const;

export type SessionKeepAliveSchema = FromSchema<typeof sessionKeepAliveSchema>;
