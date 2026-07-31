import { useOptionalPathParam } from 'hooks/useOptionalPathParam.ts';

/**
 * "Am I on the right page to open a checklist dialog?" — decided from
 * URL params (populated by react-router when the matched route has
 * `:projectId` / `:featureId`) rather than by string-prefixing the
 * pathname. Guarantees exact-segment matching (`default` vs
 * `default-team`) for free.
 *
 * When there's no feature to link to yet, `onSdkTargetRoute` collapses
 * to `onProjectRoute` — the SDK dialog belongs on the plain project
 * page, which is where "Connect SDK" would have navigated anyway.
 */
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
