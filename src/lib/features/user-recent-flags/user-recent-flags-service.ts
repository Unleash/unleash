import type { IFeatureSearchOverview } from '../../types/index.js';
import type { FeatureSearchService } from '../feature-search/feature-search-service.js';
import type { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType.js';
import type { IUserRecentFlagsReadModel } from './user-recent-flags-read-model-type.js';

export type UserRecentFlagOverview = IFeatureSearchOverview & {
    userLastUpdatedAt: Date;
};

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
    ): Promise<UserRecentFlagOverview[]> {
        const projectAccess =
            await this.privateProjectChecker.getUserAccessibleProjects(userId);
        const recentFlags =
            await this.userRecentFlagsReadModel.getUserRecentFlags(userId, {
                limit,
                offset,
                projectAccess,
            });
        if (recentFlags.length === 0) {
            return [];
        }

        const names = recentFlags.map(({ name }) => name);
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
        return recentFlags.flatMap(({ name, userLastUpdatedAt }) => {
            const feature = featuresByName.get(name);
            return feature ? [{ ...feature, userLastUpdatedAt }] : [];
        });
    }
}
