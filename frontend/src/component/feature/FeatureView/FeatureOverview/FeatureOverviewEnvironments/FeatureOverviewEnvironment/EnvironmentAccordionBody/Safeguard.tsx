import { useMemo, useState } from 'react';
import { styled, Menu, MenuItem, ListItemText, Tooltip } from '@mui/material';
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
    type SafeguardType,
} from '../../../ReleasePlan/SafeguardForm/SafeguardForm.tsx';
import { useUiFlag } from 'hooks/useUiFlag';
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

const useReleasePlanSafeguardActions = ({
    projectId,
    featureId,
    environmentName,
    plan,
    onSafeguardChange,
}: {
    projectId: string;
    featureId: string;
    environmentName: string;
    plan: IReleasePlan;
    onSafeguardChange: () => void;
}) => {
    const { setToastData, setToastApiError } = useToast();
    const { addChange } = useChangeRequestApi();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { data: pendingChangeRequests, refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const { createOrUpdateReleasePlanSafeguard, deleteReleasePlanSafeguard } =
        useSafeguardsApi();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteChangeRequestOpen, setDeleteChangeRequestOpen] =
        useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const safeguards = plan.safeguards;
    const isCR = isChangeRequestConfigured(environmentName);

    const handleSubmit = async (data: CreateSafeguardSchema) => {
        try {
            if (isCR) {
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
            } else {
                await createOrUpdateReleasePlanSafeguard({
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
            }
            onSafeguardChange();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const handleDeleteRequest = () => {
        if (safeguards.length === 0) return;

        if (isCR) {
            setDeleteChangeRequestOpen(true);
        } else {
            setDeleteDialogOpen(true);
        }
    };

    const handleDeleteConfirm = async () => {
        if (safeguards.length === 0 || isDeleting) return;

        setIsDeleting(true);
        try {
            await deleteReleasePlanSafeguard({
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
            setIsDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    const handleDeleteChangeRequestConfirm = async () => {
        if (safeguards.length === 0 || isDeleting) return;

        setIsDeleting(true);
        try {
            await addChange(projectId, environmentName, {
                feature: featureId,
                action: 'deleteSafeguard',
                payload: {
                    planId: plan.id,
                    safeguardId: safeguards[0].id,
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
            setIsDeleting(false);
            setDeleteChangeRequestOpen(false);
        }
    };

    const pendingSafeguardAction = useMemo(():
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
    }, [pendingChangeRequests, environmentName, featureId, plan.id]);

    return {
        handleSubmit,
        handleDeleteRequest,
        pendingSafeguardAction,
        deleteDialog: {
            open: deleteDialogOpen,
            isDeleting,
            onConfirm: handleDeleteConfirm,
            onClose: () => {
                if (!isDeleting) {
                    setDeleteDialogOpen(false);
                }
            },
        },
        deleteChangeRequestDialog: {
            open: deleteChangeRequestOpen,
            isDeleting,
            onConfirm: handleDeleteChangeRequestConfirm,
            onClose: () => setDeleteChangeRequestOpen(false),
        },
    };
};

interface SafeguardProps {
    plan?: IReleasePlan;
    environmentName: string;
    featureId: string;
    onSafeguardChange: () => void;
}

const ReleasePlanSafeguard = ({
    plan,
    environmentName,
    featureId,
    projectId,
    onSafeguardChange,
    onCancel,
}: {
    plan: IReleasePlan;
    environmentName: string;
    featureId: string;
    projectId: string;
    onSafeguardChange: () => void;
    onCancel: () => void;
}) => {
    const {
        handleSubmit,
        handleDeleteRequest,
        pendingSafeguardAction,
        deleteDialog,
        deleteChangeRequestDialog,
    } = useReleasePlanSafeguardActions({
        projectId,
        featureId,
        environmentName,
        plan,
        onSafeguardChange,
    });

    const safeguardBadge =
        pendingSafeguardAction === 'deleteSafeguard' ? (
            <Badge color='error'>Deleted in draft</Badge>
        ) : pendingSafeguardAction === 'changeSafeguard' ? (
            <Badge color='warning'>Modified in draft</Badge>
        ) : undefined;

    return (
        <>
            <SafeguardForm
                safeguard={plan.safeguards[0]}
                onSubmit={handleSubmit}
                onCancel={onCancel}
                onDelete={handleDeleteRequest}
                environment={environmentName}
                featureId={featureId}
                badge={safeguardBadge}
                safeguardType='releasePlan'
            />
            <DeleteSafeguardDialog
                open={deleteDialog.open}
                onClose={deleteDialog.onClose}
                onConfirm={deleteDialog.onConfirm}
                isDeleting={deleteDialog.isDeleting}
            />
            <Dialogue
                title='Request changes'
                open={deleteChangeRequestDialog.open}
                secondaryButtonText='Cancel'
                onClose={deleteChangeRequestDialog.onClose}
                primaryButtonText='Add suggestion to draft'
                onClick={deleteChangeRequestDialog.onConfirm}
                disabledPrimaryButton={deleteChangeRequestDialog.isDeleting}
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

const FeatureEnvironmentSafeguard = ({
    environmentName,
    featureId,
    projectId,
    onSafeguardChange,
    onCancel,
}: {
    environmentName: string;
    featureId: string;
    projectId: string;
    onSafeguardChange: () => void;
    onCancel: () => void;
}) => {
    const { createOrUpdateFeatureEnvironmentSafeguard } = useSafeguardsApi();
    const { setToastData, setToastApiError } = useToast();

    const handleSubmit = async (data: CreateSafeguardSchema) => {
        try {
            await createOrUpdateFeatureEnvironmentSafeguard({
                projectId,
                featureName: featureId,
                environment: environmentName,
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
    };

    return (
        <SafeguardForm
            onSubmit={handleSubmit}
            onCancel={onCancel}
            environment={environmentName}
            featureId={featureId}
            safeguardType='featureEnvironment'
        />
    );
};

export const Safeguard = ({
    plan,
    environmentName,
    featureId,
    onSafeguardChange,
}: SafeguardProps) => {
    const projectId = useRequiredPathParam('projectId');
    const featureEnvSafeguards = useUiFlag('featureEnvSafeguards');
    const { safeguardFormOpen, setSafeguardFormOpen } = useSafeguardForm(
        plan?.safeguards,
    );
    const [safeguardType, setSafeguardType] =
        useState<SafeguardType>('releasePlan');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleAddClick = (event: React.MouseEvent<HTMLElement>) => {
        if (featureEnvSafeguards) {
            setAnchorEl(event.currentTarget);
        } else {
            setSafeguardFormOpen(true);
        }
    };

    const handleMenuSelect = (type: SafeguardType) => {
        setSafeguardType(type);
        setSafeguardFormOpen(true);
        setAnchorEl(null);
    };

    const hasReleasePlan = Boolean(plan);

    return (
        <>
            <StyledSafeguardContainer>
                {safeguardFormOpen ? (
                    <>
                        {safeguardType === 'releasePlan' && plan && (
                            <ReleasePlanSafeguard
                                plan={plan}
                                environmentName={environmentName}
                                featureId={featureId}
                                projectId={projectId}
                                onSafeguardChange={onSafeguardChange}
                                onCancel={() => setSafeguardFormOpen(false)}
                            />
                        )}
                        {safeguardType === 'featureEnvironment' && (
                            <FeatureEnvironmentSafeguard
                                environmentName={environmentName}
                                featureId={featureId}
                                projectId={projectId}
                                onSafeguardChange={onSafeguardChange}
                                onCancel={() => setSafeguardFormOpen(false)}
                            />
                        )}
                    </>
                ) : (
                    <StyledAddSafeguardContent>
                        <StyledActionButton
                            onClick={handleAddClick}
                            color='primary'
                            startIcon={<Add />}
                            sx={{ m: 2 }}
                        >
                            Add safeguard
                        </StyledActionButton>
                    </StyledAddSafeguardContent>
                )}
            </StyledSafeguardContainer>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                slotProps={{
                    paper: {
                        sx: { mt: 1, ml: 1 },
                    },
                }}
            >
                <MenuItem
                    onClick={() => handleMenuSelect('featureEnvironment')}
                >
                    <ListItemText>Disable environment</ListItemText>
                </MenuItem>
                <Tooltip
                    title={
                        !hasReleasePlan
                            ? 'Requires a release plan in this environment'
                            : ''
                    }
                    placement='right'
                    arrow
                >
                    <span>
                        <MenuItem
                            disabled={!hasReleasePlan}
                            onClick={() => handleMenuSelect('releasePlan')}
                        >
                            <ListItemText>Pause automation</ListItemText>
                        </MenuItem>
                    </span>
                </Tooltip>
            </Menu>
        </>
    );
};
