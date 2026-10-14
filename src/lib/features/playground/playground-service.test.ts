import { createTestConfig } from '../../../test/config/test-config.js';
import { NotFoundError } from '../../error/index.js';
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
