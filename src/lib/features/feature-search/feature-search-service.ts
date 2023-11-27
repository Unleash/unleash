import { Logger } from '../../logger';
import {
    IFeatureStrategiesStore,
    IUnleashConfig,
    IUnleashStores,
    serializeDates,
} from '../../types';
import {
    IFeatureSearchParams,
    IQueryOperator,
    IQueryParam,
} from '../feature-toggle/types/feature-toggle-strategies-store-type';

export class FeatureSearchService {
    private featureStrategiesStore: IFeatureStrategiesStore;
    private logger: Logger;
    constructor(
        {
            featureStrategiesStore,
        }: Pick<IUnleashStores, 'featureStrategiesStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.featureStrategiesStore = featureStrategiesStore;
        this.logger = getLogger('services/feature-search-service.ts');
    }

    async search(params: IFeatureSearchParams) {
        const queryParams = this.convertToQueryParams(params);
        const { features, total } =
            await this.featureStrategiesStore.searchFeatures(
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
        const multiValueOperators = ['IS_ANY_OF', 'IS_NOT_ANY_OF'];
        const pattern = /^(IS|IS_NOT|IS_ANY_OF|IS_NOT_ANY_OF):(.+)$/;
        const match = value.match(pattern);

        if (match) {
            return {
                field,
                operator: match[1] as IQueryOperator,
                value: multiValueOperators.includes(match[1])
                    ? match[2].split(',')
                    : match[2],
            };
        }

        return null;
    };

    convertToQueryParams = (params: IFeatureSearchParams): IQueryParam[] => {
        const queryParams: IQueryParam[] = [];

        if (params.projectId) {
            const parsed = this.parseOperatorValue('project', params.projectId);
            if (parsed) queryParams.push(parsed);
        }

        return queryParams;
    };
}
