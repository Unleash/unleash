import type { FromSchema } from 'json-schema-to-ts';

export const compileSequenceRequestSchema = {
    $id: '#/components/schemas/compileSequenceRequestSchema',
    additionalProperties: false,
    description:
        'Request for the release agent compile endpoint. The author-time agent uses the prompt and the selected feature list to produce a preview Scheduled Sequence. No persistence happens here; commit is a separate POST to /sequences.',
    type: 'object',
    required: ['project', 'environment', 'prompt', 'features'],
    properties: {
        project: { type: 'string' },
        environment: { type: 'string' },
        prompt: { type: 'string' },
        features: {
            type: 'array',
            minItems: 1,
            items: { type: 'string' },
        },
    },
    components: { schemas: {} },
} as const;

export type CompileSequenceRequestSchema = FromSchema<
    typeof compileSequenceRequestSchema,
    { keepDefaultedPropertiesOptional: true }
>;
