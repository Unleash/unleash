import type { ExportResultSchema, ImportTogglesSchema } from 'openapi';
import type { ISegmentPayload } from 'interfaces/segment';

export const DEMO_PROJECT_ID = 'demo-app';
export const DEMO_PROJECT_NAME = 'Demo: Online Shop';
export const DEMO_PROJECT_DESCRIPTION =
    'A seeded example project for a fictional online shop. Explore flags in different lifecycle stages: gradual rollouts, A/B experiments, constraints, segments and a stale kill switch.';

/**
 * The import endpoint does not create segments, it only maps them by name to
 * segments that already exist. This segment is therefore created up front via
 * the segments API before the import runs.
 */
export const DEMO_SEGMENT: ISegmentPayload = {
    name: 'demo-beta-testers',
    description:
        'Demo segment: users who opted into the beta program of the online shop.',
    constraints: [
        {
            contextName: 'userId',
            operator: 'STR_ENDS_WITH',
            values: ['@beta.example.com'],
            caseInsensitive: true,
            inverted: false,
        },
    ],
};

// Arbitrary local id used to reference the segment from strategies in the
// import payload. The backend remaps it by name to the real segment id.
const DEMO_SEGMENT_REF = 1;

export const demoProjectImportData: ExportResultSchema = {
    features: [
        {
            name: 'new-checkout',
            description:
                'This flag shows a gradual rollout in progress: 50% of users get the new checkout flow. Open the strategy and drag the rollout slider to change how many users are included.',
            type: 'release',
            project: DEMO_PROJECT_ID,
            stale: false,
            impressionData: false,
            archived: false,
        },
        {
            name: 'dark-mode',
            description:
                'This flag is fully rolled out to 100% of users. A flag in this state has completed its lifecycle: in a real project you would remove it from the code and archive it.',
            type: 'release',
            project: DEMO_PROJECT_ID,
            stale: false,
            impressionData: false,
            archived: false,
        },
        {
            name: 'beta-search',
            description:
                'This flag runs an A/B experiment: beta testers are split 50/50 between two search algorithms using variants. Open the flag and check the variants on the environment to see the split.',
            type: 'experiment',
            project: DEMO_PROJECT_ID,
            stale: false,
            impressionData: true,
            archived: false,
        },
        {
            name: 'holiday-banner',
            description:
                'This flag uses a strategy constraint: only visitors with country NO, SE or DK see the holiday banner. Edit the constraint on the strategy to target different countries.',
            type: 'operational',
            project: DEMO_PROJECT_ID,
            stale: false,
            impressionData: false,
            archived: false,
        },
        {
            name: 'legacy-payment-kill',
            description:
                'This kill switch is turned off and marked as stale: the legacy payment provider has been disabled and the flag is ready to be cleaned up from the codebase and archived.',
            type: 'kill-switch',
            project: DEMO_PROJECT_ID,
            stale: true,
            impressionData: false,
            archived: false,
        },
    ],
    featureStrategies: [
        {
            name: 'flexibleRollout',
            featureName: 'new-checkout',
            title: 'Gradual rollout to 50%',
            disabled: false,
            constraints: [],
            parameters: {
                rollout: '50',
                stickiness: 'default',
                groupId: 'new-checkout',
            },
        },
        {
            name: 'flexibleRollout',
            featureName: 'dark-mode',
            title: 'Rolled out to everyone',
            disabled: false,
            constraints: [],
            parameters: {
                rollout: '100',
                stickiness: 'default',
                groupId: 'dark-mode',
            },
        },
        {
            name: 'flexibleRollout',
            featureName: 'beta-search',
            title: 'Beta testers only',
            disabled: false,
            constraints: [],
            segments: [DEMO_SEGMENT_REF],
            parameters: {
                rollout: '100',
                stickiness: 'default',
                groupId: 'beta-search',
            },
        },
        {
            name: 'flexibleRollout',
            featureName: 'holiday-banner',
            title: 'Nordic countries only',
            disabled: false,
            constraints: [
                {
                    contextName: 'country',
                    operator: 'IN',
                    values: ['NO', 'SE', 'DK'],
                    caseInsensitive: true,
                    inverted: false,
                },
            ],
            parameters: {
                rollout: '100',
                stickiness: 'default',
                groupId: 'holiday-banner',
            },
        },
        {
            name: 'flexibleRollout',
            featureName: 'legacy-payment-kill',
            title: 'Legacy payment provider',
            disabled: false,
            constraints: [],
            parameters: {
                rollout: '100',
                stickiness: 'default',
                groupId: 'legacy-payment-kill',
            },
        },
    ],
    // Note: `name` is used by the import endpoint to resolve the feature when
    // setting the enabled state, so it must be the feature name (not the
    // environment name). `featureName` is used when importing variants.
    featureEnvironments: [
        {
            name: 'new-checkout',
            featureName: 'new-checkout',
            enabled: true,
        },
        {
            name: 'dark-mode',
            featureName: 'dark-mode',
            enabled: true,
        },
        {
            name: 'beta-search',
            featureName: 'beta-search',
            enabled: true,
            variants: [
                {
                    name: 'search-algorithm-a',
                    weight: 500,
                    weightType: 'variable',
                    stickiness: 'default',
                    overrides: [],
                },
                {
                    name: 'search-algorithm-b',
                    weight: 500,
                    weightType: 'variable',
                    stickiness: 'default',
                    overrides: [],
                },
            ],
        },
        {
            name: 'holiday-banner',
            featureName: 'holiday-banner',
            enabled: true,
        },
        {
            name: 'legacy-payment-kill',
            featureName: 'legacy-payment-kill',
            enabled: false,
        },
    ],
    contextFields: [
        {
            name: 'country',
            description:
                'Demo context field: the country of the current visitor, used by the holiday-banner flag.',
            stickiness: false,
            sortOrder: 10,
        },
    ],
    tagTypes: [
        {
            name: 'simple',
            description: 'Used to simplify filtering of features',
            icon: '#',
        },
    ],
    featureTags: [
        { featureName: 'new-checkout', tagType: 'simple', tagValue: 'demo' },
        { featureName: 'dark-mode', tagType: 'simple', tagValue: 'demo' },
        { featureName: 'beta-search', tagType: 'simple', tagValue: 'demo' },
        { featureName: 'holiday-banner', tagType: 'simple', tagValue: 'demo' },
        {
            featureName: 'legacy-payment-kill',
            tagType: 'simple',
            tagValue: 'demo',
        },
    ],
    segments: [{ id: DEMO_SEGMENT_REF, name: DEMO_SEGMENT.name }],
};

export const buildDemoImportPayload = (
    environment: string,
    project: string = DEMO_PROJECT_ID,
): ImportTogglesSchema => ({
    project,
    environment,
    data: demoProjectImportData,
});

/**
 * Fallback used when the segment could not be created (e.g. missing
 * permissions): importing data that references a non-existing segment is
 * rejected by the backend, so we strip all segment references.
 */
export const withoutSegments = (
    payload: ImportTogglesSchema,
): ImportTogglesSchema => ({
    ...payload,
    data: {
        ...payload.data,
        segments: [],
        featureStrategies: payload.data.featureStrategies.map(
            ({ segments, ...strategy }) => strategy,
        ),
    },
});
