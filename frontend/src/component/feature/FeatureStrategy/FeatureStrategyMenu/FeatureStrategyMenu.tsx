import type React from 'react';
import { useEffect, useState } from 'react';
import PermissionButton, {
    type IPermissionButtonProps,
} from 'component/common/PermissionButton/PermissionButton';
import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { Box, Dialog, IconButton, styled, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import useToast from 'hooks/useToast';
import { useReleasePlansApi } from 'hooks/api/actions/useReleasePlansApi/useReleasePlansApi';
import { useFeatureReleasePlans } from 'hooks/api/getters/useFeatureReleasePlans/useFeatureReleasePlans';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ReleasePlanPreview } from './ReleasePlanPreview.tsx';
import {
    FeatureStrategyMenuCards,
    type StrategyFilterValue,
} from './FeatureStrategyMenuCards/FeatureStrategyMenuCards.tsx';
import { ReleasePlanConfirmationDialog } from './ReleasePlanConfirmationDialog.tsx';

interface IFeatureStrategyMenuProps {
    label: string;
    projectId: string;
    featureId: string;
    environmentId: string;
    variant?: IPermissionButtonProps['variant'];
    matchWidth?: boolean;
    disableReason?: string;
}

const StyledStrategyMenu = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(4, 4, 2, 4),
}));

export const FeatureStrategyMenu = ({
    label,
    projectId,
    featureId,
    environmentId,
    variant,
    matchWidth,
    disableReason,
}: IFeatureStrategyMenuProps) => {
    const [isStrategyMenuDialogOpen, setIsStrategyMenuDialogOpen] =
        useState<boolean>(false);
    const [filter, setFilter] = useState<StrategyFilterValue>(null);
    const { trackEvent } = usePlausibleTracker();
    const [selectedTemplate, setSelectedTemplate] =
        useState<IReleasePlanTemplate>();
    const [releasePlanPreview, setReleasePlanPreview] = useState(false);
    const [addReleasePlanConfirmationOpen, setAddReleasePlanConfirmationOpen] =
        useState(false);
    const dialogId = isStrategyMenuDialogOpen
        ? 'FeatureStrategyMenuDialog'
        : undefined;
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
    const crProtected = isChangeRequestConfigured(environmentId);

    const activeReleasePlan = releasePlans[0];

    const onClose = () => {
        setIsStrategyMenuDialogOpen(false);
    };

    useEffect(() => {
        if (!isStrategyMenuDialogOpen) return;
        setReleasePlanPreview(false);
    }, [isStrategyMenuDialogOpen]);

    const openMoreStrategies = (event: React.SyntheticEvent) => {
        setIsStrategyMenuDialogOpen(true);
    };

    const addReleasePlan = async (
        template: IReleasePlanTemplate,
        confirmed?: boolean,
    ) => {
        try {
            if (!confirmed && activeReleasePlan) {
                setAddReleasePlanConfirmationOpen(true);
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
                },
            });
            setAddReleasePlanConfirmationOpen(false);
            setSelectedTemplate(undefined);
            onClose();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <StyledStrategyMenu onClick={(event) => event.stopPropagation()}>
            <PermissionButton
                data-testid='ADD_STRATEGY_BUTTON'
                permission={CREATE_FEATURE_STRATEGY}
                projectId={projectId}
                environmentId={environmentId}
                onClick={openMoreStrategies}
                aria-labelledby={dialogId}
                variant={variant}
                sx={{ minWidth: matchWidth ? '282px' : 'auto' }}
                disabled={Boolean(disableReason)}
                tooltipProps={{
                    title: disableReason ? disableReason : undefined,
                }}
            >
                Add strategy
            </PermissionButton>
            <Dialog
                open={isStrategyMenuDialogOpen}
                onClose={onClose}
                maxWidth='md'
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        height: '100%',
                        width: '100%',
                    },
                }}
            >
                <>
                    <StyledHeader>
                        <Typography variant='h2'>Add strategy</Typography>
                        <IconButton
                            size='small'
                            onClick={onClose}
                            edge='end'
                            aria-label='close'
                        >
                            <CloseIcon fontSize='small' />
                        </IconButton>
                    </StyledHeader>
                    {releasePlanPreview && selectedTemplate ? (
                        <ReleasePlanPreview
                            template={selectedTemplate}
                            projectId={projectId}
                            featureName={featureId}
                            environment={environmentId}
                            activeReleasePlan={activeReleasePlan}
                            crProtected={crProtected}
                            onBack={() => setReleasePlanPreview(false)}
                            onConfirm={() => {
                                addReleasePlan(selectedTemplate);
                            }}
                        />
                    ) : (
                        <FeatureStrategyMenuCards
                            projectId={projectId}
                            featureId={featureId}
                            environmentId={environmentId}
                            filter={filter}
                            setFilter={setFilter}
                            onAddReleasePlan={(template) => {
                                setSelectedTemplate(template);
                                addReleasePlan(template);
                            }}
                            onReviewReleasePlan={(template) => {
                                setSelectedTemplate(template);
                                setReleasePlanPreview(true);
                            }}
                            onClose={onClose}
                        />
                    )}
                </>
            </Dialog>
            {selectedTemplate && (
                <ReleasePlanConfirmationDialog
                    template={selectedTemplate}
                    crProtected={crProtected}
                    open={addReleasePlanConfirmationOpen}
                    setOpen={setAddReleasePlanConfirmationOpen}
                    onConfirm={() => {
                        addReleasePlan(selectedTemplate, true);
                    }}
                />
            )}
        </StyledStrategyMenu>
    );
};
