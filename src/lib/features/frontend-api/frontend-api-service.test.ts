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

test('setFrontendCorsSettings updates cached frontend settings immediately', async () => {
    let storedSettings: any = {
        frontendApiOrigins: ['https://initial.example.com'],
    };
    const settingService = {
        getWithDefault: async () => storedSettings,
        insert: async (_key: string, value: any) => {
            storedSettings = value;
        },
    };

    const frontendApiService = new FrontendApiService(
        {
            getLogger: noLogger,
            eventBus: new EventEmitter(),
            frontendApiOrigins: [],
        } as unknown as Config,
        { settingService } as any,
        {} as any,
    );

    // Populate initial cache
    const initial = await frontendApiService.getFrontendSettings(true);
    expect(initial.frontendApiOrigins).toEqual(['https://initial.example.com']);

    // Update CORS settings
    await frontendApiService.setFrontendCorsSettings(
        ['https://updated.example.com'],
        { id: 1, username: 'test-user', ip: '127.0.0.1' },
    );

    // Cached settings should immediately reflect updated settings
    const cached = await frontendApiService.getFrontendSettings(true);
    expect(cached.frontendApiOrigins).toEqual(['https://updated.example.com']);
});
