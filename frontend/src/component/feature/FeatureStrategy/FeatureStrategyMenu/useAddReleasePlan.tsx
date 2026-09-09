import { useState } from 'react';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { releaseTemplateScopeProps } from 'component/releases/releaseTemplateScopeProps';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { useReleasePlansApi } from 'hooks/api/actions/useReleasePlansApi/useReleasePlansApi';
import { useFeatureReleasePlans } from 'hooks/api/getters/useFeatureReleasePlans/useFeatureReleasePlans';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useEventTracker } from 'hooks/useEventTracker';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ReleasePlanConfirmationDialog } from './ReleasePlanConfirmationDialog.tsx';

interface IAddReleasePlanOptions {
    projectId: string;
    featureId: string;
    environmentId: string;
    onClose: () => void;
}

export const useAddReleasePlan = ({
    projectId,
    featureId,
    environmentId,
    onClose,
}: IAddReleasePlanOptions) => {
    const { trackEvent } = useEventTracker();
    const { setToastApiError, setToastData } = useToast();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const { refetch, releasePlans } = useFeatureReleasePlans(
        projectId,
        featureId,
        environmentId,
    );
    const { addReleasePlanToFeature } = useReleasePlansApi();
    const [pendingTemplate, setPendingTemplate] =
        useState<IReleasePlanTemplate>();
    const [confirmationOpen, setConfirmationOpen] = useState(false);

    const crProtected = isChangeRequestConfigured(environmentId);
    const activeReleasePlan = releasePlans[0];

    const addReleasePlan = async (
        template: IReleasePlanTemplate,
        confirmed?: boolean,
    ) => {
        try {
            if (!confirmed && activeReleasePlan) {
                setPendingTemplate(template);
                setConfirmationOpen(true);
                return;
            }
            if (crProtected) {
                await addChange(projectId, environmentId, {
                    feature: featureId,
                    action: 'addReleasePlan',
                    payload: {
                        templateId: template.id,
                    },
                });

                setToastData({
                    type: 'success',
                    text: 'Added to draft',
                });

                refetchChangeRequests();
            } else {
                await addReleasePlanToFeature(
                    featureId,
                    template.id,
                    projectId,
                    environmentId,
                );

                setToastData({
                    type: 'success',
                    text: 'Release plan added',
                });

                refetch();
            }

            trackEvent('release-management', {
                props: {
                    eventType: 'add-plan',
                    plan: template.name,
                    ...releaseTemplateScopeProps(template.project),
                },
            });
            setConfirmationOpen(false);
            setPendingTemplate(undefined);
            onClose();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const confirmationDialog = pendingTemplate ? (
        <ReleasePlanConfirmationDialog
            template={pendingTemplate}
            crProtected={crProtected}
            open={confirmationOpen}
            setOpen={setConfirmationOpen}
            onConfirm={() => {
                addReleasePlan(pendingTemplate, true);
            }}
        />
    ) : null;

    return {
        addReleasePlan: (template: IReleasePlanTemplate) =>
            addReleasePlan(template),
        activeReleasePlan,
        crProtected,
        confirmationDialog,
    };
};
