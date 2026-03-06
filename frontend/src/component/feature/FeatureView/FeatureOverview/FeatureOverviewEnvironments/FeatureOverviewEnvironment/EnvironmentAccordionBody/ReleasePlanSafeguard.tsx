import { useState } from 'react';
import { styled } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import {
    SafeguardForm,
    useSafeguardForm,
} from '../../../ReleasePlan/SafeguardForm/SafeguardForm.tsx';
import { useSafeguardsApi } from 'hooks/api/actions/useSafeguardsApi/useSafeguardsApi';
import type { CreateSafeguardSchema } from 'openapi/models/createSafeguardSchema';
import { DeleteSafeguardDialog } from '../../../ReleasePlan/DeleteSafeguardDialog.tsx';
import { StyledActionButton } from '../../../ReleasePlan/ReleasePlanMilestoneItem/StyledActionButton.tsx';
import { Badge } from 'component/common/Badge/Badge';
import type {
    IChangeRequestChangeSafeguard,
    IChangeRequestDeleteSafeguard,
} from 'component/changeRequest/changeRequest.types';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { IReleasePlan } from 'interfaces/releasePlans';
import { strategyBackground } from 'component/common/StrategyList/StrategyListItem';

const StyledSafeguardContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(0.25, 0.25),
    backgroundColor: strategyBackground(theme),
    borderTop: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
    '& > form': {
        borderRadius: 0,
        border: 'none',
    },
}));

const StyledAddSafeguardContent = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    justifyContent: 'space-between',
    width: '100%',
    paddingRight: theme.spacing(2),
}));

interface ReleasePlanSafeguardProps {
    plan: IReleasePlan;
    environmentName: string;
    featureId: string;
    onSafeguardChange: () => void;
}

export const ReleasePlanSafeguard = ({
    plan,
    environmentName,
    featureId,
    onSafeguardChange,
}: ReleasePlanSafeguardProps) => {
    const projectId = useRequiredPathParam('projectId');
    const { setToastData, setToastApiError } = useToast();
    const { addChange } = useChangeRequestApi();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { data: pendingChangeRequests, refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const {
        createOrUpdateSafeguard,
        deleteSafeguard: deleteSafeguardApi,
        loading: safeguardLoading,
    } = useSafeguardsApi();

    const safeguards = plan.safeguards;
    const { safeguardFormOpen, setSafeguardFormOpen } =
        useSafeguardForm(safeguards);
    const [safeguardDeleteDialogOpen, setSafeguardDeleteDialogOpen] =
        useState(false);
    const [safeguardDeleteChangeRequest, setSafeguardDeleteChangeRequest] =
        useState<{ planId: string; safeguardId: string } | null>(null);

    const getPendingSafeguardAction = ():
        | IChangeRequestChangeSafeguard['action']
        | IChangeRequestDeleteSafeguard['action']
        | null => {
        if (!pendingChangeRequests) return null;

        for (const changeRequest of pendingChangeRequests) {
            if (changeRequest.environment !== environmentName) continue;

            const featureInChangeRequest = changeRequest.features.find(
                (featureItem) => featureItem.name === featureId,
            );
            if (!featureInChangeRequest) continue;

            const safeguardChange = featureInChangeRequest.changes.find(
                (
                    change,
                ): change is
                    | IChangeRequestChangeSafeguard
                    | IChangeRequestDeleteSafeguard =>
                    (change.action === 'changeSafeguard' &&
                        change.payload.planId === plan.id) ||
                    (change.action === 'deleteSafeguard' &&
                        change.payload.planId === plan.id),
            );

            if (safeguardChange) {
                return safeguardChange.action;
            }
        }

        return null;
    };

    const handleSafeguardSubmit = async (data: CreateSafeguardSchema) => {
        if (isChangeRequestConfigured(environmentName)) {
            try {
                await addChange(projectId, environmentName, {
                    feature: featureId,
                    action: 'changeSafeguard' as const,
                    payload: {
                        planId: plan.id,
                        safeguard: data,
                    },
                });
                await refetchChangeRequests();
                setToastData({
                    type: 'success',
                    text: 'Added to draft',
                });
                onSafeguardChange();
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        } else {
            try {
                await createOrUpdateSafeguard({
                    projectId,
                    featureName: featureId,
                    environment: environmentName,
                    planId: plan.id,
                    body: data,
                });
                setToastData({
                    type: 'success',
                    text: 'Safeguard added successfully',
                });
                onSafeguardChange();
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const handleSafeguardDelete = () => {
        if (
            isChangeRequestConfigured(environmentName) &&
            safeguards.length > 0
        ) {
            setSafeguardDeleteChangeRequest({
                planId: plan.id,
                safeguardId: safeguards[0].id,
            });
        } else {
            setSafeguardDeleteDialogOpen(true);
        }
    };

    const onSafeguardDeleteConfirm = async () => {
        if (safeguards.length === 0 || safeguardLoading) return;

        try {
            await deleteSafeguardApi({
                projectId,
                featureName: featureId,
                environment: environmentName,
                planId: plan.id,
                safeguardId: safeguards[0].id,
            });
            setToastData({
                type: 'success',
                text: 'Safeguard deleted successfully',
            });
            onSafeguardChange();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setSafeguardDeleteDialogOpen(false);
        }
    };

    const onSafeguardDeleteChangeRequestConfirm = async () => {
        if (!safeguardDeleteChangeRequest) return;

        try {
            await addChange(projectId, environmentName, {
                feature: featureId,
                action: 'deleteSafeguard',
                payload: {
                    planId: safeguardDeleteChangeRequest.planId,
                    safeguardId: safeguardDeleteChangeRequest.safeguardId,
                },
            });
            await refetchChangeRequests();
            setToastData({
                type: 'success',
                text: 'Added to draft',
            });
            onSafeguardChange();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setSafeguardDeleteChangeRequest(null);
        }
    };

    const handleCloseSafeguardDeleteDialog = () => {
        if (!safeguardLoading) {
            setSafeguardDeleteDialogOpen(false);
        }
    };

    const pendingSafeguardAction = getPendingSafeguardAction();
    const safeguardBadge =
        pendingSafeguardAction === 'deleteSafeguard' ? (
            <Badge color='error'>Deleted in draft</Badge>
        ) : pendingSafeguardAction === 'changeSafeguard' ? (
            <Badge color='warning'>Modified in draft</Badge>
        ) : undefined;

    return (
        <>
            <StyledSafeguardContainer>
                {safeguardFormOpen ? (
                    <SafeguardForm
                        safeguard={safeguards?.[0]}
                        onSubmit={handleSafeguardSubmit}
                        onCancel={() => setSafeguardFormOpen(false)}
                        onDelete={handleSafeguardDelete}
                        environment={environmentName}
                        featureId={featureId}
                        badge={safeguardBadge}
                    />
                ) : (
                    <StyledAddSafeguardContent>
                        <StyledActionButton
                            onClick={() => setSafeguardFormOpen(true)}
                            color='primary'
                            startIcon={<Add />}
                            sx={{ m: 2 }}
                        >
                            Add safeguard
                        </StyledActionButton>
                        {safeguardBadge}
                    </StyledAddSafeguardContent>
                )}
            </StyledSafeguardContainer>
            <DeleteSafeguardDialog
                open={safeguardDeleteDialogOpen}
                onClose={handleCloseSafeguardDeleteDialog}
                onConfirm={onSafeguardDeleteConfirm}
                isDeleting={safeguardLoading}
            />
            <Dialogue
                title='Request changes'
                open={safeguardDeleteChangeRequest !== null}
                secondaryButtonText='Cancel'
                onClose={() => setSafeguardDeleteChangeRequest(null)}
                primaryButtonText='Add suggestion to draft'
                onClick={onSafeguardDeleteChangeRequestConfirm}
            >
                <p>
                    <strong>Remove</strong> safeguard from release plan{' '}
                    <strong>{plan.name}</strong> for{' '}
                    <strong>{featureId}</strong> in{' '}
                    <strong>{environmentName}</strong>
                </p>
            </Dialogue>
        </>
    );
};
