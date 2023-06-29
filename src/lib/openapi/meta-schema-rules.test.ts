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
            'batchFeaturesSchema',
            'batchStaleSchema',
            'changePasswordSchema',
            'cloneFeatureSchema',
            'createApiTokenSchema',
            'createFeatureSchema',
            'createInvitedUserSchema',
            'createUserSchema',
            'emailSchema',
            'environmentsSchema',
            'environmentsProjectSchema',
            'eventSchema',
            'eventsSchema',
            'exportResultSchema',
            'exportQuerySchema',
            'featureEnvironmentSchema',
            'featureEventsSchema',
            'featureSchema',
            'featuresSchema',
            'featureStrategySegmentSchema',
            'featureTypeSchema',
            'featureTypesSchema',
            'featureVariantsSchema',
            'feedbackSchema',
            'groupSchema',
            'groupsSchema',
            'groupUserModelSchema',
            'idSchema',
            'loginSchema',
            'maintenanceSchema',
            'toggleMaintenanceSchema',
            'meSchema',
            'nameSchema',
            'passwordSchema',
            'patchSchema',
            'permissionSchema',
            'profileSchema',
            'projectSchema',
            'projectsSchema',
            'proxyClientSchema',
            'proxyFeatureSchema',
            'proxyFeaturesSchema',
            'pushVariantsSchema',
            'resetPasswordSchema',
            'requestsPerSecondSchema',
            'roleSchema',
            'sdkContextSchema',
            'searchEventsSchema',
            'setUiConfigSchema',
            'splashSchema',
            'stateSchema',
            'strategiesSchema',
            'tagTypeSchema',
            'tagTypesSchema',
            'tagWithVersionSchema',
            'tokenUserSchema',
            'uiConfigSchema',
            'updateApiTokenSchema',
            'updateFeatureSchema',
            'updateFeatureStrategySchema',
            'updateTagTypeSchema',
            'updateUserSchema',
            'upsertContextFieldSchema',
            'upsertStrategySchema',
            'userSchema',
            'usersGroupsBaseSchema',
            'usersSchema',
            'validateEdgeTokensSchema',
            'validatePasswordSchema',
            'validateTagTypeSchema',
            'variantFlagSchema',
            'versionSchema',
            'projectOverviewSchema',
            'importTogglesSchema',
            'importTogglesValidateSchema',
            'importTogglesValidateItemSchema',
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
            'batchFeaturesSchema',
            'batchStaleSchema',
            'changePasswordSchema',
            'cloneFeatureSchema',
            'createApiTokenSchema',
            'createFeatureSchema',
            'createFeatureStrategySchema',
            'createInvitedUserSchema',
            'createUserSchema',
            'dateSchema',
            'emailSchema',
            'environmentsSchema',
            'eventSchema',
            'eventsSchema',
            'exportResultSchema',
            'exportQuerySchema',
            'featureEventsSchema',
            'featureSchema',
            'featuresSchema',
            'featureStrategySegmentSchema',
            'featureTypeSchema',
            'featureTypesSchema',
            'featureVariantsSchema',
            'feedbackSchema',
            'groupSchema',
            'groupsSchema',
            'groupUserModelSchema',
            'idSchema',
            'loginSchema',
            'maintenanceSchema',
            'toggleMaintenanceSchema',
            'meSchema',
            'nameSchema',
            'parametersSchema',
            'passwordSchema',
            'patchesSchema',
            'patchSchema',
            'permissionSchema',
            'playgroundSegmentSchema',
            'playgroundStrategySchema',
            'profileSchema',
            'proxyClientSchema',
            'proxyFeatureSchema',
            'proxyFeaturesSchema',
            'pushVariantsSchema',
            'resetPasswordSchema',
            'requestsPerSecondSchema',
            'requestsPerSecondSegmentedSchema',
            'roleSchema',
            'setStrategySortOrderSchema',
            'setUiConfigSchema',
            'sortOrderSchema',
            'splashSchema',
            'strategiesSchema',
            'tagTypeSchema',
            'tagTypesSchema',
            'tagWithVersionSchema',
            'tokenUserSchema',
            'uiConfigSchema',
            'updateApiTokenSchema',
            'updateFeatureSchema',
            'updateFeatureStrategySchema',
            'updateTagTypeSchema',
            'updateUserSchema',
            'upsertContextFieldSchema',
            'upsertStrategySchema',
            'userSchema',
            'usersGroupsBaseSchema',
            'usersSchema',
            'usersSearchSchema',
            'validateEdgeTokensSchema',
            'validatePasswordSchema',
            'validateTagTypeSchema',
            'variantFlagSchema',
            'variantsSchema',
            'versionSchema',
            'importTogglesSchema',
            'importTogglesValidateSchema',
            'importTogglesValidateItemSchema',
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
