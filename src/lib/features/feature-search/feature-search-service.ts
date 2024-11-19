import type { Logger } from '../../logger';
import type {
    IFeatureSearchStore,
    IUnleashConfig,
    IUnleashStores,
} from '../../types';
import type {
    IFeatureSearchParams,
    IQueryParam,
} from '../feature-toggle/types/feature-toggle-strategies-store-type';
import { parseSearchOperatorValue } from './search-utils';

export class FeatureSearchService {
    private featureSearchStore: IFeatureSearchStore;
    private logger: Logger;
    constructor(
        { featureSearchStore }: Pick<IUnleashStores, 'featureSearchStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.featureSearchStore = featureSearchStore;
        this.logger = getLogger('services/feature-search-service.ts');
    }

    async search(params: IFeatureSearchParams) {
        const queryParams = this.convertToQueryParams(params);
        const { features, total } =
            await this.featureSearchStore.searchFeatures(
                {
                    ...params,
                    limit: params.limit,
                    sortBy: params.sortBy || 'createdAt',
                },
                queryParams,
            );

        return {
            features,
            total,
        };
    }

    convertToQueryParams = (params: IFeatureSearchParams): IQueryParam[] => {
        const queryParams: IQueryParam[] = [];

        if (params.state) {
            const parsedState = parseSearchOperatorValue('stale', params.state);
            if (parsedState) {
                // there's 4 possible flag states to handle:
                // a: active and not potentiallyStale
                // b: stale and not potentiallyStale
                // c: active and potentiallyStale
                // d: stale and potentiallyStale
                //
                // if stale does not include potentiallyStale,
                // the potential combinations that include potentiallyStale are:
                // IS ANY OF: active, stale, potentiallyStale = no filters => a, b, c, d
                // IS ANY OF: active, potentially stale = filter out stale => a, c
                // IS ANY OF: stale, potentially stale = I think this is a problem => b, c, d (active and not potentially stale or stale)
                // IS NONE OF: active, stale, potentiallyStale = empty set => [nothing]
                // IS NONE OF: active, potentially stale => only return stale => b, d
                // IS NONE OF: stale, potentially stale => return active without potentially stale => a
                //
                //
                // if potentiallyStale *does* include stale,
                // the potential combinations that include potentiallyStale are:
                // IS ANY OF: active, stale, potentiallyStale => a, b, c, d
                // IS ANY OF: active, potentially stale => a, c, d
                // IS ANY OF: stale, potentially stale => b, c, d (active and potentiallyStale or stale)
                // IS NONE OF: active, stale, potentiallyStale => [nothing]
                // IS NONE OF: active, potentially stale => d
                // IS NONE OF: stale, potentially stale => a
                const potentiallyStale = parsedState.values.some((value) =>
                    value?.includes('potentiallyStale'),
                );

                if (potentiallyStale) {
                    if (parsedState.values.length === 1) {
                        if (
                            parsedState.operator === 'IS' ||
                            parsedState.operator === 'IS_ANY_OF'
                        ) {
                            // exclude stale
                            queryParams.push({
                                field: 'features.potentially_stale',
                                operator: 'IS',
                                values: ['true'],
                            });
                            queryParams.push({
                                field: 'features.stale',
                                operator: 'IS',
                                values: ['false'],
                            });
                        } else if (
                            parsedState.operator === 'IS_NOT' ||
                            parsedState.operator === 'IS_NONE_OF'
                        ) {
                            // problem? active and not potentiallyStale OR stale and any potentiallyStale state
                            queryParams.push({
                                field: 'features.potentially_stale',
                                operator: 'IS_ANY_OF',
                                values: ['false', null],
                            });
                        }
                    } else if (
                        ['stale', 'active', 'potentiallyStale'].every((value) =>
                            parsedState.values.includes(value),
                        )
                    ) {
                        if (
                            parsedState.operator === 'IS' ||
                            parsedState.operator === 'IS_ANY_OF'
                        ) {
                            // do nothing
                        } else if (
                            parsedState.operator === 'IS_NOT' ||
                            parsedState.operator === 'IS_NONE_OF'
                        ) {
                            queryParams.push({
                                field: 'features.stale',
                                operator: 'IS_NONE_OF',
                                values: ['false', 'true'],
                            });
                        }
                    } else if (parsedState.values.length === 2) {
                        if (parsedState.values.includes('active')) {
                            // active && potentially stale
                            if (
                                parsedState.operator === 'IS' ||
                                parsedState.operator === 'IS_ANY_OF'
                            ) {
                                // potentially stale are a subset of active
                                queryParams.push({
                                    field: 'features.stale',
                                    operator: 'IS',
                                    values: ['false'],
                                });
                            } else if (
                                parsedState.operator === 'IS_NOT' ||
                                parsedState.operator === 'IS_NONE_OF'
                            ) {
                                // we don't care about potentially stale here
                                queryParams.push({
                                    field: 'features.stale',
                                    operator: 'IS',
                                    values: ['true'],
                                });
                            }
                        } else if (parsedState.values.includes('stale')) {
                            // stale && potentially stale
                            if (
                                parsedState.operator === 'IS' ||
                                parsedState.operator === 'IS_ANY_OF'
                            ) {
                                // problem! we need an OR-clause here:
                                // where potentially_stale is true OR stale is true (regardless of potentially_stale status)
                            } else if (
                                parsedState.operator === 'IS_NOT' ||
                                parsedState.operator === 'IS_NONE_OF'
                            ) {
                                queryParams.push({
                                    field: 'features.potentially_stale',
                                    operator: 'IS_ANY_OF',
                                    values: ['false', null],
                                });
                                queryParams.push({
                                    field: 'features.stale',
                                    operator: 'IS',
                                    values: ['false'],
                                });
                            }
                        }
                    }
                } else {
                    // do the same thing as before
                    queryParams.push({
                        field: 'stale',
                        operator: parsedState.operator,
                        values: parsedState.values.map((value) =>
                            value === 'active' ? 'false' : 'true',
                        ),
                    });
                }

                console.log(params, queryParams);
            }
        }

        if (params.createdAt) {
            const parsed = parseSearchOperatorValue(
                'features.created_at',
                params.createdAt,
            );
            if (parsed) queryParams.push(parsed);
        }

        if (params.createdBy) {
            const parsed = parseSearchOperatorValue(
                'users.id',
                params.createdBy,
            );
            if (parsed) queryParams.push(parsed);
        }

        if (params.type) {
            const parsed = parseSearchOperatorValue(
                'features.type',
                params.type,
            );
            if (parsed) queryParams.push(parsed);
        }

        ['tag', 'segment', 'project'].forEach((field) => {
            if (params[field]) {
                const parsed = parseSearchOperatorValue(field, params[field]);
                if (parsed) queryParams.push(parsed);
            }
        });

        return queryParams;
    };
}
