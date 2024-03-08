import { ProxyService, Config } from './proxy-service';
import { GlobalFrontendApiCache } from '../proxy/global-frontend-api-cache';
import { IApiUser } from '../types';
import { FeatureInterface } from 'unleash-client/lib/feature';
import noLogger from '../../test/fixtures/no-logger';
import { ApiTokenType } from '../types/models/api-token';

test('proxy service fetching features from global cache', async () => {
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
                        { name: 'default', parameters: [], constraints: [] },
                    ],
                },
                {
                    name: 'toggleB',
                    enabled: false,
                    project: 'projectA',
                    type: 'release',
                    variants: [],
                    strategies: [
                        { name: 'default', parameters: [], constraints: [] },
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
    const proxyService = new ProxyService(
        { getLogger: noLogger } as unknown as Config,
        irrelevant,
        irrelevant,
        globalFrontendApiCache,
    );

    const features = await proxyService.getNewProxyFeatures(
        {
            projects: ['irrelevant'],
            environment: 'irrelevant',
            type: ApiTokenType.FRONTEND,
        } as unknown as IApiUser,
        {},
    );

    expect(features).toMatchObject([{ name: 'toggleA' }]);
    expect(features).toHaveLength(1);
});
