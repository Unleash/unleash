import { FeatureSchema, useGetArchivedFeatures } from 'openapi';

export interface IUseFeaturesArchiveOutput {
    archivedFeatures?: FeatureSchema[];
    refetchArchived: () => void;
    loading: boolean;
    error?: Error;
}

export const useFeaturesArchive = (): IUseFeaturesArchiveOutput => {
    const {
        data,
        mutate: refetch,
        error,
        isLoading: loading,
    } = useGetArchivedFeatures();

    return {
        archivedFeatures: data?.features,
        refetchArchived: refetch,
        loading,
        error: error as Error | undefined,
    };
};
