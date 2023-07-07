import Ajv, { Schema } from 'ajv';
import { schemas } from '.';

const ajv = new Ajv();

type SchemaNames = keyof typeof schemas;
type Rule = {
    name: string;
    match?: (
        schemaName: string,
        schema: typeof schemas[SchemaNames],
    ) => boolean;
    metaSchema: Schema;
    knownExceptions?: string[];
};

/**
 * These rules are applied to all schemas in the spec.
 *
 * The rules usually start as a meta schema, which is a schema that describes
 * the shape of the OpenAPI schemas. Usually they look like this:
 *
 * <code>
 * const metaSchema: Schema = {
 *   type: 'object',
 *   properties: {
 *     // what we want to specify about the schema
 *   }
 * }
 * </code>
 */
const metaRules: Rule[] = [
    {
        name: 'should have a type',
        metaSchema: {
            type: 'object',
            properties: {
                type: { type: 'string', enum: ['object', 'array'] },
            },
            required: ['type'],
        },
        knownExceptions: ['dateSchema'],
    },
    {
        name: 'should have an $id with the expected format',
        metaSchema: {
            type: 'object',
            properties: {
                $id: {
                    type: 'string',
                    pattern: '^#/components/schemas/[a-z][a-zA-Z]+$',
                },
            },
            required: ['$id'],
        },
    },
    {
        name: 'should have properties with descriptions',
        match: (_, schema) => {
            // only match schemas that have a properties field
            return 'properties' in schema;
        },
        metaSchema: {
            type: 'object',
            // properties of the meta schema
            properties: {
                // the schema should have a field called properties
                properties: {
                    type: 'object', // properties of the schema should be an object
                    additionalProperties: {
                        // with the following shape
                        anyOf: [
                            {
                                type: 'object',
                                properties: {
                                    description: { type: 'string' },
                                },
                                required: ['description'],
                            },
                            {
                                type: 'object',
                                properties: {
                                    $ref: { type: 'string' },
                                },
                                required: ['$ref'],
                            },
                        ],
                    },
                },
            },
        },
        knownExceptions: [
            'batchStaleSchema',
            'cloneFeatureSchema',
            'createFeatureSchema',
            'createInvitedUserSchema',
            'environmentsSchema',
            'environmentsProjectSchema',
            'featureEnvironmentSchema',
            'featuresSchema',
            'featureStrategySegmentSchema',
            'featureTypeSchema',
            'featureTypesSchema',
            'featureVariantsSchema',
            'groupSchema',
            'groupsSchema',
            'groupUserModelSchema',
            'maintenanceSchema',
            'toggleMaintenanceSchema',
            'patchSchema',
            'projectSchema',
            'projectsSchema',
            'pushVariantsSchema',
            'resetPasswordSchema',
            'requestsPerSecondSchema',
            'sdkContextSchema',
            'setUiConfigSchema',
            'splashSchema',
            'stateSchema',
            'strategiesSchema',
            'tagTypeSchema',
            'tagTypesSchema',
            'tagWithVersionSchema',
            'uiConfigSchema',
            'updateFeatureSchema',
            'updateTagTypeSchema',
            'upsertContextFieldSchema',
            'upsertStrategySchema',
            'usersGroupsBaseSchema',
            'validateEdgeTokensSchema',
            'validateTagTypeSchema',
            'variantFlagSchema',
            'versionSchema',
            'projectOverviewSchema',
        ],
    },
    {
        name: 'should have a description',
        metaSchema: {
            type: 'object',
            properties: {
                description: { type: 'string' },
            },
            required: ['description'],
        },
        knownExceptions: [
            'adminFeaturesQuerySchema',
            'applicationSchema',
            'applicationsSchema',
            'batchStaleSchema',
            'cloneFeatureSchema',
            'createFeatureSchema',
            'createInvitedUserSchema',
            'dateSchema',
            'environmentsSchema',
            'featuresSchema',
            'featureStrategySegmentSchema',
            'featureTypeSchema',
            'featureTypesSchema',
            'featureVariantsSchema',
            'groupSchema',
            'groupsSchema',
            'groupUserModelSchema',
            'maintenanceSchema',
            'toggleMaintenanceSchema',
            'patchesSchema',
            'patchSchema',
            'playgroundSegmentSchema',
            'playgroundStrategySchema',
            'pushVariantsSchema',
            'resetPasswordSchema',
            'requestsPerSecondSchema',
            'requestsPerSecondSegmentedSchema',
            'setStrategySortOrderSchema',
            'setUiConfigSchema',
            'sortOrderSchema',
            'splashSchema',
            'strategiesSchema',
            'tagTypeSchema',
            'tagTypesSchema',
            'tagWithVersionSchema',
            'uiConfigSchema',
            'updateFeatureSchema',
            'updateTagTypeSchema',
            'upsertContextFieldSchema',
            'upsertStrategySchema',
            'usersGroupsBaseSchema',
            'usersSearchSchema',
            'validateEdgeTokensSchema',
            'validateTagTypeSchema',
            'variantFlagSchema',
            'variantsSchema',
            'versionSchema',
        ],
    },
];

describe.each(metaRules)('OpenAPI schemas $name', (rule) => {
    const validateMetaSchema = ajv.compile(rule.metaSchema);

    // test all schemas against the rule
    Object.entries(schemas).forEach(([schemaName, schema]) => {
        if (!rule.match || rule.match(schemaName, schema)) {
            it(`${schemaName}`, () => {
                validateMetaSchema(schema);

                // note: whenever you resolve an exception please remove it from the list
                if (rule.knownExceptions?.includes(schemaName)) {
                    console.warn(
                        `${schemaName} is a known exception to rule "${rule.name}" that should be fixed`,
                    );
                    expect(validateMetaSchema.errors).not.toBeNull();
                } else {
                    expect(validateMetaSchema.errors).toBeNull();
                }
            });
        }
    });
});
