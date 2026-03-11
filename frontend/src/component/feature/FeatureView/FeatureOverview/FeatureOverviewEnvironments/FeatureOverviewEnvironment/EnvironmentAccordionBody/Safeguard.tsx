import { useMemo, useState } from 'react';
import { styled, Menu, MenuItem, Tooltip } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import {
    SafeguardFormDirect,
    type SafeguardType,
} from '../../../ReleasePlan/SafeguardForm/SafeguardForm.tsx';
import { SafeguardChangeRequestDialog } from '../../../ReleasePlan/SafeguardForm/SafeguardChangeRequestDialog.tsx';
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
import type { ISafeguard } from 'interfaces/releasePlans';
import { strategyBackground } from 'component/common/StrategyList/StrategyListItem';
import { useUiFlag } from 'hooks/useUiFlag';

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

export const AddSafeguard = ({
    onSelect,
    releasePlan,
}: {
    onSelect: (type: SafeguardType) => void;
    releasePlan?: { id: string; name: string };
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const featureEnvSafeguardsEnabled = useUiFlag('featureEnvSafeguards');

    if (!featureEnvSafeguardsEnabled && !releasePlan) return null;

    return (
        <StyledSafeguardContainer>
            <StyledAddSafeguardContent>
                <StyledActionButton
                    onClick={(e) => {
                        if (featureEnvSafeguardsEnabled) {
                            setAnchorEl(e.currentTarget);
                        } else {
                            onSelect('releasePlan');
                        }
                    }}
                    color='primary'
                    startIcon={<Add />}
                    sx={{ m: 2 }}
                >
                    Add safeguard
                </StyledActionButton>
            </StyledAddSafeguardContent>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem
                    onClick={() => {
                        onSelect('featureEnvironment');
                        setAnchorEl(null);
                    }}
                >
                    Disable environment
                </MenuItem>
                <Tooltip
                    title={
                        releasePlan
                            ? ''
                            : 'Add a release plan to use this safeguard'
                    }
                    placement='right'
                    arrow
                >
                    <span>
                        <MenuItem
                            disabled={!releasePlan}
                            onClick={() => {
                                onSelect('releasePlan');
                                setAnchorEl(null);
                            }}
                        >
                            Pause automation
                        </MenuItem>
                    </span>
                </Tooltip>
            </Menu>
        </StyledSafeguardContainer>
    );
};

const useReleasePlanSafeguardActions = ({
    projectId,
    featureId,
    environmentName,
    releasePlan,
    safeguard,
    onSafeguardChange,
}: {
    projectId: string;
    featureId: string;
    environmentName: string;
    releasePlan: { id: string; name: string };
    safeguard?: ISafeguard;
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
    const [submitChangeRequestOpen, setSubmitChangeRequestOpen] =
        useState(false);
    const [pendingSubmitData, setPendingSubmitData] =
        useState<CreateSafeguardSchema | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const isCR = isChangeRequestConfigured(environmentName);

    const handleSubmit = async (data: CreateSafeguardSchema) => {
        if (isCR) {
            setPendingSubmitData(data);
            setSubmitChangeRequestOpen(true);
            return;
        }

        try {
            await createOrUpdateReleasePlanSafeguard({
                projectId,
                featureName: featureId,
                environment: environmentName,
                planId: releasePlan.id,
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

    const handleSubmitChangeRequestConfirm = async () => {
        if (!pendingSubmitData) return;

        try {
            await addChange(projectId, environmentName, {
                feature: featureId,
                action: 'changeSafeguard' as const,
                payload: {
                    planId: releasePlan.id,
                    safeguard: pendingSubmitData,
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
            setSubmitChangeRequestOpen(false);
            setPendingSubmitData(null);
        }
    };

    const handleDeleteRequest = () => {
        if (!safeguard) return;

        if (isCR) {
            setDeleteChangeRequestOpen(true);
        } else {
            setDeleteDialogOpen(true);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!safeguard || isDeleting) return;

        setIsDeleting(true);
        try {
            await deleteReleasePlanSafeguard({
                projectId,
                featureName: featureId,
                environment: environmentName,
                planId: releasePlan.id,
                safeguardId: safeguard.id,
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
        if (!safeguard || isDeleting) return;

        setIsDeleting(true);
        try {
            await addChange(projectId, environmentName, {
                feature: featureId,
                action: 'deleteSafeguard',
                payload: {
                    planId: releasePlan.id,
                    safeguardId: safeguard.id,
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
                        change.payload.planId === releasePlan.id) ||
                    (change.action === 'deleteSafeguard' &&
                        change.payload.planId === releasePlan.id),
            );

            if (safeguardChange) {
                return safeguardChange.action;
            }
        }

        return null;
    }, [pendingChangeRequests, environmentName, featureId, releasePlan.id]);

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
        submitChangeRequestDialog: {
            open: submitChangeRequestOpen,
            data: pendingSubmitData,
            onConfirm: handleSubmitChangeRequestConfirm,
            onClose: () => {
                setSubmitChangeRequestOpen(false);
                setPendingSubmitData(null);
            },
        },
    };
};

const ReleasePlanSafeguardForm = ({
    releasePlan,
    safeguard,
    environmentName,
    featureId,
    onSafeguardChange,
    onCancel,
}: {
    releasePlan: { id: string; name: string };
    safeguard?: ISafeguard;
    environmentName: string;
    featureId: string;
    onSafeguardChange: () => void;
    onCancel: () => void;
}) => {
    const projectId = useRequiredPathParam('projectId');
    const {
        handleSubmit,
        handleDeleteRequest,
        pendingSafeguardAction,
        deleteDialog,
        deleteChangeRequestDialog,
        submitChangeRequestDialog,
    } = useReleasePlanSafeguardActions({
        projectId,
        featureId,
        environmentName,
        releasePlan,
        safeguard,
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
            <SafeguardFormDirect
                safeguard={safeguard}
                onSubmit={handleSubmit}
                onCancel={onCancel}
                onDelete={handleDeleteRequest}
                environment={environmentName}
                featureId={featureId}
                badge={safeguardBadge}
                safeguardType='releasePlan'
            />
            {submitChangeRequestDialog.data && (
                <SafeguardChangeRequestDialog
                    isOpen={submitChangeRequestDialog.open}
                    onConfirm={submitChangeRequestDialog.onConfirm}
                    onClose={submitChangeRequestDialog.onClose}
                    safeguardData={submitChangeRequestDialog.data}
                    environment={environmentName}
                    mode={safeguard ? 'edit' : 'create'}
                />
            )}
            {safeguard && (
                <DeleteSafeguardDialog
                    open={deleteDialog.open}
                    onClose={deleteDialog.onClose}
                    onConfirm={deleteDialog.onConfirm}
                    isDeleting={deleteDialog.isDeleting}
                />
            )}
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
                    <strong>{releasePlan.name}</strong> for{' '}
                    <strong>{featureId}</strong> in{' '}
                    <strong>{environmentName}</strong>
                </p>
            </Dialogue>
        </>
    );
};

export const ReleasePlanSafeguard = ({
    releasePlan,
    safeguard,
    environmentName,
    featureId,
    onSafeguardChange,
    onCancel = () => {},
}: {
    releasePlan: { id: string; name: string };
    safeguard?: ISafeguard;
    environmentName: string;
    featureId: string;
    onSafeguardChange: () => void;
    onCancel?: () => void;
}) => (
    <StyledSafeguardContainer>
        <ReleasePlanSafeguardForm
            releasePlan={releasePlan}
            safeguard={safeguard}
            environmentName={environmentName}
            featureId={featureId}
            onSafeguardChange={onSafeguardChange}
            onCancel={onCancel}
        />
    </StyledSafeguardContainer>
);

const FeatureEnvironmentSafeguardForm = ({
    environmentName,
    featureId,
    onSafeguardChange,
    onCancel,
    safeguard,
}: {
    environmentName: string;
    featureId: string;
    onSafeguardChange: () => void;
    onCancel: () => void;
    safeguard?: ISafeguard;
}) => {
    const projectId = useRequiredPathParam('projectId');
    const {
        createOrUpdateFeatureEnvironmentSafeguard,
        deleteFeatureEnvironmentSafeguard,
    } = useSafeguardsApi();
    const { setToastData, setToastApiError } = useToast();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleDeleteRequest = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!safeguard || isDeleting) return;
        setIsDeleting(true);
        try {
            await deleteFeatureEnvironmentSafeguard({
                projectId,
                featureName: featureId,
                environment: environmentName,
                safeguardId: safeguard.id,
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

    return (
        <>
            <SafeguardFormDirect
                safeguard={safeguard}
                onSubmit={handleSubmit}
                onCancel={onCancel}
                onDelete={safeguard ? handleDeleteRequest : undefined}
                environment={environmentName}
                featureId={featureId}
                safeguardType='featureEnvironment'
            />
            {safeguard && (
                <DeleteSafeguardDialog
                    open={deleteDialogOpen}
                    onClose={() => {
                        if (!isDeleting) {
                            setDeleteDialogOpen(false);
                        }
                    }}
                    onConfirm={handleDeleteConfirm}
                    isDeleting={isDeleting}
                />
            )}
        </>
    );
};

export const FeatureEnvironmentSafeguard = ({
    safeguard,
    environmentName,
    featureId,
    onSafeguardChange,
    onCancel = () => {},
}: {
    safeguard?: ISafeguard;
    environmentName: string;
    featureId: string;
    onSafeguardChange: () => void;
    onCancel?: () => void;
}) => (
    <StyledSafeguardContainer>
        <FeatureEnvironmentSafeguardForm
            safeguard={safeguard}
            environmentName={environmentName}
            featureId={featureId}
            onSafeguardChange={onSafeguardChange}
            onCancel={onCancel}
        />
    </StyledSafeguardContainer>
);

export const Safeguard = ({
    featureEnvSafeguard,
    releasePlan,
    releasePlanSafeguard,
    environmentName,
    featureId,
    onSafeguardChange,
}: {
    featureEnvSafeguard?: ISafeguard;
    releasePlan?: { id: string; name: string };
    releasePlanSafeguard?: ISafeguard;
    environmentName: string;
    featureId: string;
    onSafeguardChange: () => void;
}) => {
    const [addingType, setAddingType] = useState<SafeguardType | null>(null);

    const handleSafeguardChange = () => {
        setAddingType(null);
        onSafeguardChange();
    };

    if (featureEnvSafeguard) {
        return (
            <FeatureEnvironmentSafeguard
                safeguard={featureEnvSafeguard}
                environmentName={environmentName}
                featureId={featureId}
                onSafeguardChange={handleSafeguardChange}
            />
        );
    }

    if (releasePlanSafeguard && releasePlan) {
        return (
            <ReleasePlanSafeguard
                releasePlan={releasePlan}
                safeguard={releasePlanSafeguard}
                environmentName={environmentName}
                featureId={featureId}
                onSafeguardChange={handleSafeguardChange}
            />
        );
    }

    if (addingType === 'featureEnvironment') {
        return (
            <FeatureEnvironmentSafeguard
                environmentName={environmentName}
                featureId={featureId}
                onSafeguardChange={handleSafeguardChange}
                onCancel={() => setAddingType(null)}
            />
        );
    }

    if (addingType === 'releasePlan' && releasePlan) {
        return (
            <ReleasePlanSafeguard
                releasePlan={releasePlan}
                environmentName={environmentName}
                featureId={featureId}
                onSafeguardChange={handleSafeguardChange}
                onCancel={() => setAddingType(null)}
            />
        );
    }

    return <AddSafeguard onSelect={setAddingType} releasePlan={releasePlan} />;
};
