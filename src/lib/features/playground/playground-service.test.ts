import { createTestConfig } from '../../../test/config/test-config.js';
import { BadDataError, NotFoundError } from '../../error/index.js';
import { PayloadType } from 'unleash-client';
import type { FeatureConfigurationClient } from '../feature-toggle/types/feature-toggle-strategies-store-type.js';
import { createFakePlaygroundService } from './createPlaygroundService.js';

const defaultUserId = 1;

const createFeature = (
    overrides: Partial<FeatureConfigurationClient> = {},
): FeatureConfigurationClient => ({
    name: 'default-feature',
    type: 'release',
    enabled: true,
    project: 'default',
    stale: false,
    strategies: [{ name: 'default', parameters: {}, constraints: [] }],
    variants: [],
    ...overrides,
});

describe('evaluateFeature', () => {
    it('reports a flag that does not exist as not found', async () => {
        const { playgroundService } = createFakePlaygroundService(
            createTestConfig(),
        );

        await expect(
            playgroundService.evaluateFeature(
                'missing-flag',
                'development',
                { appName: 'test' },
                defaultUserId,
            ),
        ).rejects.toThrow(NotFoundError);
    });

    it('hides flags in projects the user can not access', async () => {
        const {
            playgroundService,
            playgroundReadModel,
            privateProjectChecker,
        } = createFakePlaygroundService(createTestConfig());
        playgroundReadModel.features = [
            createFeature({ name: 'private-flag', project: 'private' }),
        ];
        privateProjectChecker.inaccessibleProjects = ['private'];

        await expect(
            playgroundService.evaluateFeature(
                'private-flag',
                'development',
                { appName: 'test' },
                defaultUserId,
            ),
        ).rejects.toThrow(NotFoundError);
    });
});

describe('evaluateAdvancedQuery', () => {
    it('rejects a context that expands past the limit even when there are no features to evaluate', async () => {
        const { playgroundService } = createFakePlaygroundService(
            createTestConfig({
                experimental: {
                    flags: {
                        advancedPlayground: {
                            name: 'limit',
                            enabled: true,
                            payload: { type: PayloadType.STRING, value: '2' },
                        },
                    },
                },
            }),
        );

        await expect(
            playgroundService.evaluateAdvancedQuery(
                ['project-without-features'],
                ['development'],
                { appName: 'test', properties: { userId: 'a,b,c' } },
                defaultUserId,
            ),
        ).rejects.toThrow(BadDataError);
    });
});
