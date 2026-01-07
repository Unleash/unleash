import { FrontendApiService, type Config } from './frontend-api-service.js';
import type { GlobalFrontendApiCache } from './global-frontend-api-cache.js';
import type { IApiUser } from '../../types/index.js';
import type { FeatureInterface } from 'unleash-client/lib/feature.js';
import noLogger from '../../../test/fixtures/no-logger.js';
import { ApiTokenType } from '../../types/model.js';
import EventEmitter from 'events';
import { FRONTEND_API_REPOSITORY_CREATED } from '../../metric-events.js';

test('frontend api service fetching features from global cache', async () => {
    const irrelevant = {} as any;
    const globalFrontendApiCache = {
        getToggles(_: IApiUser): FeatureInterface[] {
            return [
                {
                    name: 'toggleA',
                    enabled: true,
                    project: 'projectA',
                    type: 'release',
                    variants: [],
                    strategies: [
                        { name: 'default', parameters: {}, constraints: [] },
                    ],
                },
                {
                    name: 'toggleB',
                    enabled: false,
                    project: 'projectA',
                    type: 'release',
                    variants: [],
                    strategies: [
                        { name: 'default', parameters: {}, constraints: [] },
                    ],
                },
            ];
        },
        getToggle(name: string, token: IApiUser): FeatureInterface {
            return this.getToggles(token).find(
                (t) => t.name === name,
            ) as FeatureInterface;
        },
    } as GlobalFrontendApiCache;
    const eventBus = new EventEmitter();
    let createdFrontendRepositoriesCount = 0;
    eventBus.on(FRONTEND_API_REPOSITORY_CREATED, () => {
        createdFrontendRepositoriesCount++;
    });
    const frontendApiService = new FrontendApiService(
        { getLogger: noLogger, eventBus } as unknown as Config,
        irrelevant,
        globalFrontendApiCache,
    );

    const features = await frontendApiService.getFrontendApiFeatures(
        {
            projects: ['irrelevant'],
            environment: 'irrelevant',
            type: ApiTokenType.FRONTEND,
        } as unknown as IApiUser,
        {},
    );

    expect(features).toMatchObject([{ name: 'toggleA' }]);
    expect(features).toHaveLength(1);
    expect(createdFrontendRepositoriesCount).toBe(1);
});
