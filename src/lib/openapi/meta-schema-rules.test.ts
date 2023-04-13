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
            'addonParameterSchema',
            'addonSchema',
            'addonsSchema',
            'addonTypeSchema',
            'apiTokenSchema',
            'apiTokensSchema',
            'applicationSchema',
            'applicationsSchema',
            'batchFeaturesSchema',
            'batchStaleSchema',
            'bulkRegistrationSchema',
            'bulkMetricsSchema',
            'changePasswordSchema',
            'clientApplicationSchema',
            'clientFeatureSchema',
            'clientFeaturesQuerySchema',
            'clientFeaturesSchema',
            'clientMetricsSchema',
            'clientMetricsEnvSchema',
            'cloneFeatureSchema',
            'contextFieldSchema',
            'contextFieldsSchema',
            'createApiTokenSchema',
            'createFeatureSchema',
            'createFeatureStrategySchema',
            'createInvitedUserSchema',
            'createUserSchema',
            'dateSchema',
            'edgeTokenSchema',
            'emailSchema',
            'environmentsSchema',
            'eventSchema',
            'eventsSchema',
            'exportResultSchema',
            'exportQuerySchema',
            'featureEnvironmentMetricsSchema',
            'featureEventsSchema',
            'featureMetricsSchema',
            'featureSchema',
            'featuresSchema',
            'featureStrategySchema',
            'featureStrategySegmentSchema',
            'featureTypeSchema',
            'featureTypesSchema',
            'featureUsageSchema',
            'featureVariantsSchema',
            'feedbackSchema',
            'groupSchema',
            'groupsSchema',
            'groupUserModelSchema',
            'healthCheckSchema',
            'healthOverviewSchema',
            'healthReportSchema',
            'idSchema',
            'instanceAdminStatsSchema',
            'legalValueSchema',
            'loginSchema',
            'maintenanceSchema',
            'toggleMaintenanceSchema',
            'meSchema',
            'nameSchema',
            'overrideSchema',
            'parametersSchema',
            'passwordSchema',
            'patchesSchema',
            'patchSchema',
            'patSchema',
            'patsSchema',
            'permissionSchema',
            'playgroundSegmentSchema',
            'playgroundStrategySchema',
            'profileSchema',
            'projectEnvironmentSchema',
            'proxyClientSchema',
            'proxyFeatureSchema',
            'proxyFeaturesSchema',
            'publicSignupTokenCreateSchema',
            'publicSignupTokenSchema',
            'publicSignupTokensSchema',
            'publicSignupTokenUpdateSchema',
            'pushVariantsSchema',
            'resetPasswordSchema',
            'requestsPerSecondSchema',
            'requestsPerSecondSegmentedSchema',
            'roleSchema',
            'segmentSchema',
            'setStrategySortOrderSchema',
            'setUiConfigSchema',
            'sortOrderSchema',
            'splashSchema',
            'stateSchema',
            'strategiesSchema',
            'strategySchema',
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
            'upsertSegmentSchema',
            'upsertStrategySchema',
            'userSchema',
            'usersGroupsBaseSchema',
            'usersSchema',
            'usersSearchSchema',
            'validateEdgeTokensSchema',
            'validatePasswordSchema',
            'validateTagTypeSchema',
            'variantSchema',
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

    // test all schemas agaisnt the rule
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
