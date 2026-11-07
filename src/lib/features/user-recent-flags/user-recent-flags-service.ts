import type { IFeatureSearchOverview } from '../../types/index.js';
import type { FeatureSearchService } from '../feature-search/feature-search-service.js';
import type { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType.js';
import type { IUserRecentFlagsReadModel } from './user-recent-flags-read-model-type.js';

export class UserRecentFlagsService {
    private userRecentFlagsReadModel: IUserRecentFlagsReadModel;

    private featureSearchService: Pick<FeatureSearchService, 'search'>;

    private privateProjectChecker: Pick<
        IPrivateProjectChecker,
        'getUserAccessibleProjects'
    >;

    constructor(
        userRecentFlagsReadModel: IUserRecentFlagsReadModel,
        featureSearchService: Pick<FeatureSearchService, 'search'>,
        privateProjectChecker: Pick<
            IPrivateProjectChecker,
            'getUserAccessibleProjects'
        >,
    ) {
        this.userRecentFlagsReadModel = userRecentFlagsReadModel;
        this.featureSearchService = featureSearchService;
        this.privateProjectChecker = privateProjectChecker;
    }

    async getUserRecentFlags(
        userId: number,
        { limit, offset }: { limit: number; offset: number },
    ): Promise<IFeatureSearchOverview[]> {
        const projectAccess =
            await this.privateProjectChecker.getUserAccessibleProjects(userId);
        const names =
            await this.userRecentFlagsReadModel.getUserRecentFlagNames(userId, {
                limit,
                offset,
                projectAccess,
            });
        if (names.length === 0) {
            return [];
        }

        const { features } = await this.featureSearchService.search({
            userId,
            featureNames: names,
            limit: names.length,
            offset: 0,
            sortOrder: 'asc',
        });
        const featuresByName = new Map(
            features.map((feature) => [feature.name, feature]),
        );
        return names.flatMap((name) => {
            const feature = featuresByName.get(name);
            return feature ? [feature] : [];
        });
    }
}
