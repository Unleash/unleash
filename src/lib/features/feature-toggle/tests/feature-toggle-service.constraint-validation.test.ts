import { createFakeFeatureToggleService } from '../createFeatureToggleService.js';
import type {
    IFlagResolver,
    IUnleashConfig,
} from '../../../types/index.js';
import getLogger from '../../../../test/fixtures/no-logger.js';
import { REGEX } from '../../../util/constants.js';
import { describe, test, expect } from 'vitest';

const alwaysOnFlagResolver = {
    isEnabled() {
        return true;
    },
} as unknown as IFlagResolver;

const createService = () =>
    createFakeFeatureToggleService({
        getLogger,
        flagResolver: alwaysOnFlagResolver,
        resourceLimits: {},
    } as unknown as IUnleashConfig);

describe('validateConstraint', () => {
    test('should reject invalid regex', async () => {
        const { featureToggleService } = createService();

        await expect(
            featureToggleService.validateConstraint({
                contextName: 'someField',
                operator: REGEX,
                value: '(unclosed',
                values: [],
            }),
        ).rejects.toThrow('not a valid regex string');
    });

    test('should accept valid regex', async () => {
        const { featureToggleService } = createService();

        const result = await featureToggleService.validateConstraint({
            contextName: 'someField',
            operator: REGEX,
            value: '^[a-z]+$',
            values: [],
        });

        expect(result.operator).toBe(REGEX);
    });

    test('should validate regex value against legal values when context field has legal values', async () => {
        const { featureToggleService, contextFieldStore } = createService();

        await contextFieldStore.create({
            name: 'customField',
            description: 'A custom field',
            sortOrder: 0,
            stickiness: false,
            legalValues: [
                { value: '^valid-pattern$' },
                { value: '^another-pattern$' },
            ],
        });

        // Regex value that IS in legal values should pass
        await expect(
            featureToggleService.validateConstraint({
                contextName: 'customField',
                operator: REGEX,
                value: '^valid-pattern$',
                values: [],
            }),
        ).resolves.toBeDefined();

        // Regex value that is NOT in legal values should fail
        await expect(
            featureToggleService.validateConstraint({
                contextName: 'customField',
                operator: REGEX,
                value: '^not-a-legal-value$',
                values: [],
            }),
        ).rejects.toThrow('is not specified as a legal value');
    });

    test('REGEX operator uses constraint.value (singular) for legal value validation, not constraint.values', async () => {
        const { featureToggleService, contextFieldStore } = createService();

        await contextFieldStore.create({
            name: 'regexField',
            description: 'Field with legal values',
            sortOrder: 0,
            stickiness: false,
            legalValues: [{ value: '^allowed$' }],
        });

        // Even though constraint.values contains something not in legal values,
        // REGEX operator should only check constraint.value (singular)
        await expect(
            featureToggleService.validateConstraint({
                contextName: 'regexField',
                operator: REGEX,
                value: '^allowed$',
                values: ['not-in-legal-values'],
            }),
        ).resolves.toBeDefined();
    });
});
