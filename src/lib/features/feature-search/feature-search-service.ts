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
                // there's 4 possible states to handle:
                // active and potentiallyStale
                // active and not potentiallyStale
                // stale and potentiallyStale
                // stale and not potentiallyStale
                //
                //
                // the potential combinations are:
                // IS ANY OF: active, stale, potentiallyStale = no filters
                // IS ANY OF: active, potentially stale = filter out stale
                // IS ANY OF: stale, potentially stale = no additional filtering needed
                // IS NONE OF: active, stale, potentiallyStale = empty set
                // IS NONE OF: active, potentially stale => only return stale
                // IS NONE OF: stale, potentially stale => return active without potentially stale, no additional stuff needed
                const potentiallyStale = parsedState.values.some((value) =>
                    value?.includes('potentiallyStale'),
                );
                if (potentiallyStale) {
                    if (
                        parsedState.operator === 'IS' ||
                        parsedState.operator === 'IS_ANY_OF'
                    ) {
                        queryParams.push({
                            field: 'features.potentially_stale',
                            operator: 'IS',
                            values: ['true'],
                        });
                    } else {
                        queryParams.push({
                            field: 'features.potentially_stale',
                            operator: 'IS_ANY_OF',
                            values: [null, 'false'],
                        });
                    }
                }
                const otherValues = parsedState.values.filter(
                    (value) => !value?.includes('potentiallyStale'),
                );

                if (otherValues.length) {
                    queryParams.push({
                        field: 'stale',
                        operator: parsedState.operator,
                        values: otherValues.map((value) =>
                            value === 'active' ? 'false' : 'true',
                        ),
                    });
                }
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
