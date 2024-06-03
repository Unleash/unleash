import { useCheckDependenciesExist } from 'hooks/api/getters/useCheckDependenciesExist/useCheckDependenciesExist';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export const useShowDependentFeatures = (project: string) => {
    const { dependenciesExist } = useCheckDependenciesExist(project);
    const { isOss } = useUiConfig();

    return Boolean(project) && Boolean(isOss() ? dependenciesExist : true);
};
