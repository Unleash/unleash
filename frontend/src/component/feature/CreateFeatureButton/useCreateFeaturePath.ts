import { useDefaultProjectId } from 'hooks/api/getters/useDefaultProject/useDefaultProjectId';
import { getCreateTogglePath } from 'utils/routePathHelpers';

interface IUseCreateFeaturePathOutput {
    path: string;
    projectId: string;
}

export const useCreateFeaturePath = (filter: {
    query?: string;
    project: string;
}): IUseCreateFeaturePathOutput | undefined => {
    const defaultProjectId = useDefaultProjectId();

    const projectId =
        filter.project === '*' || !filter.project
            ? defaultProjectId
            : filter.project;

    if (!projectId) {
        return;
    }

    return {
        path: getCreateTogglePath(projectId),
        projectId,
    };
};
