import { useOptionalPathParam } from 'hooks/useOptionalPathParam.ts';

// Uses router params (not pathname prefix) so `default` doesn't match
// `default-team`. Without a feature, `onSdkTargetRoute` collapses to
// `onProjectRoute` — the SDK dialog lives on the plain project page.
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
    return { onProjectRoute, onSdkTargetRoute };
};
