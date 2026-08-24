export const transitionConditionSchema = {
    $id: '#/components/schemas/transitionConditionSchema',
    type: 'object',
    description: 'A transition condition for milestone progression',
    example: { type: 'time', intervalMinutes: 30 },
    oneOf: [
        {
            type: 'object',
            additionalProperties: false,
            required: ['intervalMinutes'],
            description:
                'Transition after a fixed amount of time from milestone start',
            properties: {
                type: {
                    type: 'string',
                    enum: ['time'],
                    description:
                        'Discriminator for time-based transitions. Omitting it means time-based.',
                    example: 'time',
                },
                intervalMinutes: {
                    type: 'integer',
                    minimum: 1,
                    description: 'The interval in minutes before transitioning',
                    example: 30,
                },
            },
        },
        {
            type: 'object',
            additionalProperties: false,
            required: ['type', 'minimumExposures'],
            description:
                'Transition once the feature has been exposed (evaluated as enabled) enough times in total',
            properties: {
                type: {
                    type: 'string',
                    enum: ['exposure'],
                    description: 'Discriminator for exposure-based transitions',
                    example: 'exposure',
                },
                minimumExposures: {
                    type: 'integer',
                    minimum: 1,
                    description:
                        'The total number of enabled evaluations of the feature required before transitioning',
                    example: 1000,
                },
            },
        },
    ],
    components: {},
} as const;

export type TransitionConditionSchema =
    | {
          type?: 'time';
          intervalMinutes: number;
      }
    | {
          type: 'exposure';
          minimumExposures: number;
      };
