import { useOptionalPathParam } from 'hooks/useOptionalPathParam.ts';

export const useChecklistRouteMatch = ({
    projectId,
    feature,
}: {
    projectId: string;
    feature: string | undefined;
}) => {
    const pathProjectId = useOptionalPathParam('projectId');
    const pathFeatureId = useOptionalPathParam('featureId');
    const onProjectRoute = pathProjectId === projectId;
    const onSdkTargetRoute =
        onProjectRoute && (feature ? pathFeatureId === feature : true);
    const onFlagPage =
        onProjectRoute && Boolean(feature) && pathFeatureId === feature;
    return { onProjectRoute, onSdkTargetRoute, onFlagPage };
};
