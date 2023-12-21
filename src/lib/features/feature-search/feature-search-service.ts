import { Logger } from '../../logger';
import {
    IFeatureSearchStore,
    IUnleashConfig,
    IUnleashStores,
} from '../../types';
import {
    IFeatureSearchParams,
    IQueryOperator,
    IQueryParam,
} from '../feature-toggle/types/feature-toggle-strategies-store-type';

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
                },
                queryParams,
            );

        return {
            features,
            total,
        };
    }

    parseOperatorValue = (field: string, value: string): IQueryParam | null => {
        const pattern =
            /^(IS|IS_NOT|IS_ANY_OF|IS_NONE_OF|INCLUDE|DO_NOT_INCLUDE|INCLUDE_ALL_OF|INCLUDE_ANY_OF|EXCLUDE_IF_ANY_OF|EXCLUDE_ALL|IS_BEFORE|IS_ON_OR_AFTER):(.+)$/;
        const match = value.match(pattern);

        if (match) {
            return {
                field,
                operator: match[1] as IQueryOperator,
                values: match[2].split(','),
            };
        }

        return null;
    };

    convertToQueryParams = (params: IFeatureSearchParams): IQueryParam[] => {
        const queryParams: IQueryParam[] = [];

        if (params.state) {
            const parsedState = this.parseOperatorValue('stale', params.state);
            if (parsedState) {
                parsedState.values = parsedState.values.map((value) =>
                    value === 'active' ? 'false' : 'true',
                );
                queryParams.push(parsedState);
            }
        }

        if (params.createdAt) {
            const parsed = this.parseOperatorValue(
                'features.created_at',
                params.createdAt,
            );
            if (parsed) queryParams.push(parsed);
        }

        ['tag', 'segment', 'project'].forEach((field) => {
            if (params[field]) {
                const parsed = this.parseOperatorValue(field, params[field]);
                if (parsed) queryParams.push(parsed);
            }
        });

        return queryParams;
    };
}
