import { openApiAdmin } from 'utils/openapiClient';
import { FeatureSchema } from 'openapi';
import { useApiGetter } from 'hooks/api/getters/useApiGetter/useApiGetter';

export interface IUseProjectFeaturesArchiveOutput {
    archivedFeatures?: FeatureSchema[];
    refetchArchived: () => void;
    loading: boolean;
    error?: Error;
}

export const useProjectFeaturesArchive = (
    projectId: string
): IUseProjectFeaturesArchiveOutput => {
    const { data, refetch, loading, error } = useApiGetter(
        ['apiAdminArchiveFeaturesGet', projectId],
        () => {
            if (projectId) {
                return openApiAdmin.apiAdminArchiveFeaturesProjectIdGet({
                    projectId,
                });
            }
            return openApiAdmin.apiAdminArchiveFeaturesGet();
        }
    );

    return {
        archivedFeatures: data?.features,
        refetchArchived: refetch,
        loading,
        error,
    };
};
