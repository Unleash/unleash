import { createFakeFeatureToggleService } from '../createFeatureToggleService.js';
import type {
    IAuditUser,
    IFlagResolver,
    IUnleashConfig,
} from '../../../types/index.js';
import getLogger from '../../../../test/fixtures/no-logger.js';
import { describe, test, expect, beforeEach } from 'vitest';

const alwaysOffFlagResolver = {
    isEnabled() {
        return false;
    },
} as unknown as IFlagResolver;

const auditUser: IAuditUser = {
    id: 1,
    username: 'test',
    ip: '127.0.0.1',
};

const featureTypeSeed = [
    { id: 'release', name: 'Release', description: '', lifetimeDays: 40 },
    {
        id: 'experiment',
        name: 'Experiment',
        description: '',
        lifetimeDays: 40,
    },
    {
        id: 'operational',
        name: 'Operational',
        description: '',
        lifetimeDays: 7,
    },
    {
        id: 'kill-switch',
        name: 'Kill switch',
        description: '',
        lifetimeDays: null,
    },
    {
        id: 'permission',
        name: 'Permission',
        description: '',
        lifetimeDays: null,
    },
];

const makeConfig = (): IUnleashConfig =>
    ({
        getLogger,
        flagResolver: alwaysOffFlagResolver,
        resourceLimits: {},
    }) as unknown as IUnleashConfig;

describe('target date auto-calculation on feature creation', () => {
    let featureToggleService: ReturnType<
        typeof createFakeFeatureToggleService
    >['featureToggleService'];
    let featureTypeStore: ReturnType<
        typeof createFakeFeatureToggleService
    >['featureTypeStore'];
    let projectStore: ReturnType<
        typeof createFakeFeatureToggleService
    >['projectStore'];

    beforeEach(async () => {
        const result = createFakeFeatureToggleService(makeConfig());
        featureToggleService = result.featureToggleService;
        featureTypeStore = result.featureTypeStore;
        projectStore = result.projectStore;

        (featureTypeStore as any).featureTypes = featureTypeSeed.map((t) => ({
            ...t,
        }));

        await projectStore.create({
            id: 'default',
            name: 'default',
            description: '',
            mode: 'open' as any,
            defaultStickiness: 'default',
        });
    });

    test('auto-calculates targetDate for release type (40 days)', async () => {
        const before = new Date();
        const feature = await featureToggleService.createFeatureToggle(
            'default',
            { name: 'my-release-flag', type: 'release' },
            auditUser,
        );
        const after = new Date();

        expect(feature.targetDate).toBeDefined();
        const targetDate = new Date(feature.targetDate!);
        const msIn40Days = 40 * 24 * 60 * 60 * 1000;
        expect(targetDate.getTime()).toBeGreaterThanOrEqual(
            before.getTime() + msIn40Days,
        );
        expect(targetDate.getTime()).toBeLessThanOrEqual(
            after.getTime() + msIn40Days,
        );
    });

    test('auto-calculates targetDate for operational type (7 days)', async () => {
        const before = new Date();
        const feature = await featureToggleService.createFeatureToggle(
            'default',
            { name: 'my-operational-flag', type: 'operational' },
            auditUser,
        );
        const after = new Date();

        expect(feature.targetDate).toBeDefined();
        const targetDate = new Date(feature.targetDate!);
        const msIn7Days = 7 * 24 * 60 * 60 * 1000;
        expect(targetDate.getTime()).toBeGreaterThanOrEqual(
            before.getTime() + msIn7Days,
        );
        expect(targetDate.getTime()).toBeLessThanOrEqual(
            after.getTime() + msIn7Days,
        );
    });

    test('does not set targetDate for kill-switch type', async () => {
        const feature = await featureToggleService.createFeatureToggle(
            'default',
            { name: 'my-kill-switch', type: 'kill-switch' },
            auditUser,
        );

        expect(feature.targetDate).toBeUndefined();
    });

    test('does not set targetDate for permission type', async () => {
        const feature = await featureToggleService.createFeatureToggle(
            'default',
            { name: 'my-permission-flag', type: 'permission' },
            auditUser,
        );

        expect(feature.targetDate).toBeUndefined();
    });

    test('respects explicitly provided targetDate over auto-calculation', async () => {
        const explicitDate = new Date('2030-01-01T00:00:00.000Z');
        const feature = await featureToggleService.createFeatureToggle(
            'default',
            {
                name: 'my-explicit-date-flag',
                type: 'release',
                targetDate: explicitDate,
            },
            auditUser,
        );

        expect(feature.targetDate).toBeDefined();
        expect(new Date(feature.targetDate!).toISOString()).toBe(
            explicitDate.toISOString(),
        );
    });

    test('allows explicit null targetDate to suppress auto-calculation', async () => {
        const feature = await featureToggleService.createFeatureToggle(
            'default',
            {
                name: 'my-no-date-flag',
                type: 'release',
                targetDate: null,
            },
            auditUser,
        );

        expect(feature.targetDate == null).toBe(true);
    });
});
