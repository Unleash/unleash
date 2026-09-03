import { describe, expect, it } from 'vitest';
import { getFeatureStatusText } from './getFeatureStatusText.js';
import type { FeatureStatus } from './getFeatureStatus.js';

describe('getFeatureStatusText', () => {
    it.each<[FeatureStatus, string, string | undefined]>([
        [
            { type: 'noTraffic' },
            'No traffic',
            'A non-production environment is enabled',
        ],
        [
            { type: 'noStrategies', environment: 'non-production' },
            'No strategies',
            'No strategies in non-production environment',
        ],
        [
            { type: 'noStrategies', environment: 'production' },
            'No strategies',
            'No strategies added in the production environment',
        ],
        [
            { type: 'noEnabledStrategies' },
            'No enabled strategies',
            'All strategies in non-production environments are disabled',
        ],
        [
            { type: 'paused', environment: 'non-production' },
            'Paused',
            'All non-production environments are disabled',
        ],
        [
            { type: 'paused', environment: 'any' },
            'Paused',
            'No environment enabled',
        ],
        [
            { type: 'paused', environment: 'production' },
            'Paused',
            'Production environments are disabled',
        ],
        [
            {
                type: 'partialProduction',
                enabledEnvironments: ['production-eu', 'production-apac'],
                total: 3,
            },
            'In 2 out of 3 production environments',
            'Enabled in: production-eu, production-apac',
        ],
        [
            { type: 'noProductionEnvironments' },
            'No production environments',
            undefined,
        ],
        [
            { type: 'milestone', name: 'First step', order: 1, total: 2 },
            'Milestone: First step (1 of 2)',
            undefined,
        ],
        [
            { type: 'milestone', name: null, order: 2, total: 3 },
            'Milestone 2 of 3',
            undefined,
        ],
        [{ type: 'ok' }, '–', 'No issues detected'],
        [{ type: 'unknown' }, '–', 'We are lacking data about this flag'],
    ])('describes %o', (status, label, description) => {
        expect(getFeatureStatusText(status)).toEqual({ label, description });
    });
});
