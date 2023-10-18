import { useUiFlag } from 'hooks/useUiFlag';
import { useCheckDependenciesExist } from 'hooks/api/getters/useCheckDependenciesExist/useCheckDependenciesExist';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export const useShowDependentFeatures = (project: string) => {
    const dependentFeatures = useUiFlag('dependentFeatures');
    const { dependenciesExist } = useCheckDependenciesExist(project);
    const { isOss } = useUiConfig();

    return Boolean(
        isOss() ? dependenciesExist && dependentFeatures : dependentFeatures,
    );
};
