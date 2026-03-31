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
    IChangeRequestChangeFeatureEnvSafeguard,
    IChangeRequestDeleteFeatureEnvSafeguard,
} from 'component/changeRequest/changeRequest.types';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { IReleasePlan, ISafeguard } from 'interfaces/releasePlans';
import { strategyBackground } from 'component/common/StrategyList/StrategyListItem';
import { useUiFlag } from 'hooks/useUiFlag';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

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
    const { trackEvent } = usePlausibleTracker();

    if (!featureEnvSafeguardsEnabled && !releasePlan) return null;

    return (
        <StyledSafeguardContainer>
            <StyledAddSafeguardContent>
                <StyledActionButton
                    onClick={(e) => {
                        if (featureEnvSafeguardsEnabled) {
                            trackEvent('safeguards', {
                                props: {
                                    eventType: 'choose safeguard opened',
                                },
                            });
                            setAnchorEl(e.currentTarget);
                        } else {
                            trackEvent('safeguards', {
                                props: {
                                    eventType: 'form opened',
                                    safeguardType: 'releasePlan',
                                },
                            });
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
                        trackEvent('safeguards', {
                            props: {
                                eventType: 'form opened',
                                safeguardType: 'featureEnvironment',
                            },
                        });
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
                                trackEvent('safeguards', {
                                    props: {
                                        eventType: 'form opened',
                                        safeguardType: 'releasePlan',
                                    },
                                });
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

const useSafeguardActions = ({
    projectId,
    featureId,
    environmentName,
    safeguardType,
    releasePlan,
    safeguard,
    onSafeguardChange,
}: {
    projectId: string;
    featureId: string;
    environmentName: string;
    safeguardType: SafeguardType;
    releasePlan?: { id: string; name: string };
    safeguard?: ISafeguard;
    onSafeguardChange: () => void;
}) => {
    const { setToastData, setToastApiError } = useToast();
    const { trackEvent } = usePlausibleTracker();
    const { addChange } = useChangeRequestApi();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { data: pendingChangeRequests, refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const {
        createOrUpdateReleasePlanSafeguard,
        deleteReleasePlanSafeguard,
        createOrUpdateFeatureEnvironmentSafeguard,
        deleteFeatureEnvironmentSafeguard,
    } = useSafeguardsApi();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteChangeRequestOpen, setDeleteChangeRequestOpen] =
        useState(false);
    const [submitChangeRequestOpen, setSubmitChangeRequestOpen] =
        useState(false);
    const [pendingSubmitData, setPendingSubmitData] =
        useState<CreateSafeguardSchema | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const isCR = isChangeRequestConfigured(environmentName);

    const createOrUpdate =
        safeguardType === 'releasePlan' && releasePlan
            ? (data: CreateSafeguardSchema) =>
                  createOrUpdateReleasePlanSafeguard({
                      projectId,
                      featureName: featureId,
                      environment: environmentName,
                      planId: releasePlan.id,
                      body: data,
                  })
            : (data: CreateSafeguardSchema) =>
                  createOrUpdateFeatureEnvironmentSafeguard({
                      projectId,
                      featureName: featureId,
                      environment: environmentName,
                      body: data,
                  });

    const deleteSafeguard =
        safeguardType === 'releasePlan' && releasePlan
            ? (safeguardId: string) =>
                  deleteReleasePlanSafeguard({
                      projectId,
                      featureName: featureId,
                      environment: environmentName,
                      planId: releasePlan.id,
                      safeguardId,
                  })
            : (safeguardId: string) =>
                  deleteFeatureEnvironmentSafeguard({
                      projectId,
                      featureName: featureId,
                      environment: environmentName,
                      safeguardId,
                  });

    const handleSubmit = async (data: CreateSafeguardSchema) => {
        trackEvent('safeguards', {
            props: {
                eventType: 'safeguard submitted',
                safeguardType,
            },
        });

        if (isCR) {
            setPendingSubmitData(data);
            setSubmitChangeRequestOpen(true);
            return;
        }

        try {
            await createOrUpdate(data);
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
            if (safeguardType === 'featureEnvironment') {
                await addChange(projectId, environmentName, {
                    feature: featureId,
                    action: 'changeFeatureEnvSafeguard' as const,
                    payload: {
                        safeguard: pendingSubmitData,
                    },
                });
            } else {
                if (!releasePlan) return;
                await addChange(projectId, environmentName, {
                    feature: featureId,
                    action: 'changeReleasePlanSafeguard' as const,
                    payload: {
                        planId: releasePlan.id,
                        safeguard: pendingSubmitData,
                    },
                });
            }
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
            await deleteSafeguard(safeguard.id);
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
            if (safeguardType === 'featureEnvironment') {
                await addChange(projectId, environmentName, {
                    feature: featureId,
                    action: 'deleteFeatureEnvSafeguard',
                    payload: {
                        safeguardId: safeguard.id,
                    },
                });
            } else {
                if (!releasePlan) return;
                await addChange(projectId, environmentName, {
                    feature: featureId,
                    action: 'deleteReleasePlanSafeguard',
                    payload: {
                        planId: releasePlan.id,
                        safeguardId: safeguard.id,
                    },
                });
            }
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

    type SafeguardChange =
        | IChangeRequestChangeSafeguard
        | IChangeRequestDeleteSafeguard
        | IChangeRequestChangeFeatureEnvSafeguard
        | IChangeRequestDeleteFeatureEnvSafeguard;

    const isSafeguardChange = (change: {
        action: string;
        payload?: unknown;
    }): change is SafeguardChange => {
        const isReleasePlan =
            (change.action === 'changeReleasePlanSafeguard' ||
                change.action === 'deleteReleasePlanSafeguard') &&
            !!releasePlan &&
            (change.payload as { planId?: string })?.planId === releasePlan.id;

        const isFeatureEnv =
            change.action === 'changeFeatureEnvSafeguard' ||
            change.action === 'deleteFeatureEnvSafeguard';

        return isReleasePlan || isFeatureEnv;
    };

    const pendingSafeguardAction = useMemo(():
        | SafeguardChange['action']
        | null => {
        if (!pendingChangeRequests) return null;

        for (const changeRequest of pendingChangeRequests) {
            if (changeRequest.environment !== environmentName) continue;

            const featureInChangeRequest = changeRequest.features.find(
                (featureItem) => featureItem.name === featureId,
            );
            if (!featureInChangeRequest) continue;

            const safeguardChange =
                featureInChangeRequest.changes.find(isSafeguardChange);

            if (safeguardChange) {
                return safeguardChange.action;
            }
        }

        return null;
    }, [pendingChangeRequests, environmentName, featureId, releasePlan?.id]);

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

const SafeguardForm = ({
    safeguardType,
    releasePlan,
    safeguard,
    environmentName,
    featureId,
    onSafeguardChange,
    onCancel,
}: {
    safeguardType: SafeguardType;
    releasePlan?: { id: string; name: string };
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
    } = useSafeguardActions({
        projectId,
        featureId,
        environmentName,
        safeguardType,
        releasePlan,
        safeguard,
        onSafeguardChange,
    });

    const isDeleteAction =
        pendingSafeguardAction === 'deleteReleasePlanSafeguard' ||
        pendingSafeguardAction === 'deleteFeatureEnvSafeguard';
    const isChangeAction =
        pendingSafeguardAction === 'changeReleasePlanSafeguard' ||
        pendingSafeguardAction === 'changeFeatureEnvSafeguard';

    const safeguardBadge = isDeleteAction ? (
        <Badge color='error'>Deleted in draft</Badge>
    ) : isChangeAction ? (
        <Badge color='warning'>Modified in draft</Badge>
    ) : undefined;

    return (
        <>
            <SafeguardFormDirect
                safeguard={safeguard}
                onSubmit={handleSubmit}
                onCancel={onCancel}
                onDelete={safeguard ? handleDeleteRequest : undefined}
                environment={environmentName}
                featureId={featureId}
                badge={safeguardBadge}
                safeguardType={safeguardType}
            />
            {submitChangeRequestDialog.data && (
                <SafeguardChangeRequestDialog
                    isOpen={submitChangeRequestDialog.open}
                    onConfirm={submitChangeRequestDialog.onConfirm}
                    onClose={() => {
                        submitChangeRequestDialog.onClose();
                        onCancel();
                    }}
                    safeguardData={submitChangeRequestDialog.data}
                    environment={environmentName}
                    mode={safeguard ? 'edit' : 'create'}
                    safeguardType={safeguardType}
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
            {safeguard && (
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
                        <strong>Remove</strong> safeguard
                        {releasePlan && (
                            <>
                                {' '}
                                from release plan{' '}
                                <strong>{releasePlan.name}</strong>
                            </>
                        )}{' '}
                        for <strong>{featureId}</strong> in{' '}
                        <strong>{environmentName}</strong>
                    </p>
                </Dialogue>
            )}
        </>
    );
};

export const Safeguard = ({
    featureEnvSafeguard,
    releasePlan,
    environmentName,
    featureId,
    onSafeguardChange,
}: {
    featureEnvSafeguard?: ISafeguard;
    releasePlan?: IReleasePlan;
    environmentName: string;
    featureId: string;
    onSafeguardChange: () => void;
}) => {
    const releasePlanSafeguard = releasePlan?.safeguards?.[0];
    const [addingType, setAddingType] = useState<SafeguardType | null>(null);

    const handleExistingChange = () => {
        setAddingType(null);
        onSafeguardChange();
    };

    const hasExisting = featureEnvSafeguard || releasePlanSafeguard;

    if (hasExisting) {
        return (
            <>
                {featureEnvSafeguard && (
                    <StyledSafeguardContainer>
                        <SafeguardForm
                            safeguardType='featureEnvironment'
                            safeguard={featureEnvSafeguard}
                            environmentName={environmentName}
                            featureId={featureId}
                            onSafeguardChange={handleExistingChange}
                            onCancel={() => {}}
                        />
                    </StyledSafeguardContainer>
                )}
                {releasePlanSafeguard && (
                    <StyledSafeguardContainer>
                        <SafeguardForm
                            safeguardType='releasePlan'
                            releasePlan={releasePlan}
                            safeguard={releasePlanSafeguard}
                            environmentName={environmentName}
                            featureId={featureId}
                            onSafeguardChange={handleExistingChange}
                            onCancel={() => {}}
                        />
                    </StyledSafeguardContainer>
                )}
            </>
        );
    }

    if (addingType === 'featureEnvironment') {
        return (
            <StyledSafeguardContainer>
                <SafeguardForm
                    safeguardType='featureEnvironment'
                    environmentName={environmentName}
                    featureId={featureId}
                    onSafeguardChange={onSafeguardChange}
                    onCancel={() => setAddingType(null)}
                />
            </StyledSafeguardContainer>
        );
    }

    if (addingType === 'releasePlan' && releasePlan) {
        return (
            <StyledSafeguardContainer>
                <SafeguardForm
                    safeguardType='releasePlan'
                    releasePlan={releasePlan}
                    environmentName={environmentName}
                    featureId={featureId}
                    onSafeguardChange={onSafeguardChange}
                    onCancel={() => setAddingType(null)}
                />
            </StyledSafeguardContainer>
        );
    }

    return <AddSafeguard onSelect={setAddingType} releasePlan={releasePlan} />;
};

export default Safeguard;
