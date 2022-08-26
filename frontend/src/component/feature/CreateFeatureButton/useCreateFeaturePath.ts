import { useDefaultProjectId } from 'hooks/api/getters/useDefaultProject/useDefaultProjectId';
import { IFeaturesFilter } from 'hooks/useFeaturesFilter';
import { getCreateTogglePath } from 'utils/routePathHelpers';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import AccessContext from 'contexts/AccessContext';
import { useContext } from 'react';

interface IUseCreateFeaturePathOutput {
    path: string;
    access: boolean;
}

export const useCreateFeaturePath = (
    filter: IFeaturesFilter
): IUseCreateFeaturePathOutput | undefined => {
    const { hasAccess } = useContext(AccessContext);
    const defaultProjectId = useDefaultProjectId();
    const { uiConfig } = useUiConfig();

    const selectedProjectId =
        filter.project === '*' || !filter.project
            ? defaultProjectId
            : filter.project;

    if (!selectedProjectId) {
        return;
    }

    return {
        path: getCreateTogglePath(selectedProjectId, uiConfig.flags.E),
        access: hasAccess(CREATE_FEATURE, selectedProjectId),
    };
};
