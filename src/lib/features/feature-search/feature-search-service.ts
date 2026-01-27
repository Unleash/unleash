import type {
    IFeatureSearchStore,
    IUnleashConfig,
    IUnleashStores,
} from '../../types/index.js';
import type {
    IFeatureSearchParams,
    IQueryParam,
} from '../feature-toggle/types/feature-toggle-strategies-store-type.js';
import type { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType.js';
import { parseSearchOperatorValue } from './search-utils.js';

export class FeatureSearchService {
    private featureSearchStore: IFeatureSearchStore;
    private privateProjectChecker: IPrivateProjectChecker;

    constructor(
        { featureSearchStore }: Pick<IUnleashStores, 'featureSearchStore'>,
        _config: Pick<IUnleashConfig, 'getLogger'>,
        privateProjectChecker: IPrivateProjectChecker,
    ) {
        this.featureSearchStore = featureSearchStore;
        this.privateProjectChecker = privateProjectChecker;
    }

    async search(params: IFeatureSearchParams) {
        const queryParams = await this.convertToQueryParams(params);
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

    convertToQueryParams = async (
        params: IFeatureSearchParams,
    ): Promise<IQueryParam[]> => {
        const queryParams: IQueryParam[] = [];

        if (params.state) {
            const parsedState = parseSearchOperatorValue('stale', params.state);
            if (parsedState) {
                queryParams.push(parsedState);
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

        if (params.lastSeenAt) {
            const parsed = parseSearchOperatorValue(
                'lastSeenAt',
                params.lastSeenAt,
            );
            if (parsed) queryParams.push(parsed);
        }

        ['tag', 'segment', 'project'].forEach((field) => {
            if (params[field]) {
                const parsed = parseSearchOperatorValue(field, params[field]);
                if (parsed) queryParams.push(parsed);
            }
        });

        const accessibleProjects =
            await this.privateProjectChecker.getUserAccessibleProjects(
                params.userId,
            );
        if (accessibleProjects.mode === 'limited') {
            queryParams.push({
                field: 'features.project',
                operator: 'IS_ANY_OF',
                values: accessibleProjects.projects,
            });
        }
        return queryParams;
    };
}
