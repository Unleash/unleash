import type { IFeatureToggleStore, IProject } from '../../types/index.js';
import type { IProjectHealthFeaturesReadModel } from './features-read-model.js';

export const calculateHealthRating = ({
    totalCount,
    staleCount,
    potentiallyStaleCount,
}: {
    totalCount: number;
    staleCount: number;
    potentiallyStaleCount: number;
}): number => {
    const startPercentage = 100;
    const stalePercentage = (staleCount / totalCount) * 100 || 0;
    const potentiallyStalePercentage =
        (potentiallyStaleCount / totalCount) * 100 || 0;
    const rating = Math.round(
        startPercentage - stalePercentage - potentiallyStalePercentage,
    );

    return rating;
};

export const calculateProjectHealthRating =
    (
        featuresReadModel: IProjectHealthFeaturesReadModel,
        featureToggleStore: IFeatureToggleStore,
    ) =>
    async ({ id }: Pick<IProject, 'id'>): Promise<number> => {
        const features = await featureToggleStore.getAll({
            project: id,
            archived: false,
        });

        const potentiallyStaleCount =
            await featuresReadModel.getPotentiallyStaleCount(id);

        return calculateHealthRating({
            totalCount: features.length,
            staleCount: features.filter((flag) => flag.stale).length,
            potentiallyStaleCount,
        });
    };
