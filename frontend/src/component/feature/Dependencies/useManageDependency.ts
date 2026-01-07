import { type ParentValue, REMOVE_DEPENDENCY_OPTION } from './constants.js';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import useToast from 'hooks/useToast';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useHighestPermissionChangeRequestEnvironment } from 'hooks/useHighestPermissionChangeRequestEnvironment';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useDependentFeaturesApi } from 'hooks/api/actions/useDependentFeaturesApi/useDependentFeaturesApi';
import { formatUnknownError } from '../../../utils/formatUnknownError.js';

export const useManageDependency = (
    project: string,
    featureId: string,
    parent: string,
    parentValue: ParentValue,
    onClose: () => void,
) => {
    const { trackEvent } = usePlausibleTracker();
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(project);
    const { setToastData, setToastApiError } = useToast();
    const { refetchFeature } = useFeature(project, featureId);
    const environment = useHighestPermissionChangeRequestEnvironment(project)();
    const { isChangeRequestConfiguredInAnyEnv } =
        useChangeRequestsEnabled(project);
    const { addDependency, removeDependencies } =
        useDependentFeaturesApi(project);

    const handleAddChange = async (
        actionType: 'addDependency' | 'deleteDependency',
    ) => {
        if (!environment) {
            console.error('No change request environment');
            return;
        }
        if (actionType === 'addDependency') {
            await addChange(project, environment, [
                {
                    action: actionType,
                    feature: featureId,
                    payload: {
                        feature: parent,
                        enabled: parentValue.status !== 'disabled',
                        variants:
                            parentValue.status === 'enabled_with_variants'
                                ? parentValue.variants
                                : [],
                    },
                },
            ]);
            trackEvent('dependent_features', {
                props: {
                    eventType: 'dependency added',
                },
            });
        }
        if (actionType === 'deleteDependency') {
            await addChange(project, environment, [
                { action: actionType, feature: featureId, payload: undefined },
            ]);
        }
        void refetchChangeRequests();
        setToastData({
            type: 'success',
            text: 'Change added to draft',
        });
    };

    return async () => {
        try {
            if (isChangeRequestConfiguredInAnyEnv()) {
                const actionType =
                    parent === REMOVE_DEPENDENCY_OPTION.key
                        ? 'deleteDependency'
                        : 'addDependency';
                await handleAddChange(actionType);
                trackEvent('dependent_features', {
                    props: {
                        eventType:
                            actionType === 'addDependency'
                                ? 'add dependency added to change request'
                                : 'delete dependency added to change request',
                    },
                });
            } else if (parent === REMOVE_DEPENDENCY_OPTION.key) {
                await removeDependencies(featureId);
                trackEvent('dependent_features', {
                    props: {
                        eventType: 'dependency removed',
                    },
                });
                setToastData({ text: 'Dependency removed', type: 'success' });
            } else {
                await addDependency(featureId, {
                    feature: parent,
                    enabled: parentValue.status !== 'disabled',
                    variants:
                        parentValue.status === 'enabled_with_variants'
                            ? parentValue.variants
                            : [],
                });
                trackEvent('dependent_features', {
                    props: {
                        eventType: 'dependency added',
                    },
                });
                setToastData({ text: 'Dependency added', type: 'success' });
            }
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
        void refetchFeature();
        onClose();
    };
};
