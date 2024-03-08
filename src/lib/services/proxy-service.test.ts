import { ProxyService } from './proxy-service';
import { GlobalFrontendApiCache } from '../proxy/global-frontend-api-cache';
import { IApiUser } from '../types';
import { FeatureInterface } from 'unleash-client/lib/feature';
import noLogger from '../../test/fixtures/no-logger';
import { ApiTokenType } from '../types/models/api-token';

test('proxy service fetching features from global cache', async () => {
    const irrelevant = {} as any;
    const globalFrontendApiCache = {
        getToggles(token: IApiUser): FeatureInterface[] {
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
        getSegment(id: number) {
            return undefined;
        },
    } as GlobalFrontendApiCache;
    const proxyService = new ProxyService(
        { getLogger: noLogger } as any,
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
