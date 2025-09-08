import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PermissionButton, {
    type IPermissionButtonProps,
} from 'component/common/PermissionButton/PermissionButton';
import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { Dialog, styled } from '@mui/material';
import { LegacyFeatureStrategyMenuCards } from './LegacyFeatureStrategyMenuCards/LegacyFeatureStrategyMenuCards.tsx';
import { formatCreateStrategyPath } from '../FeatureStrategyCreate/FeatureStrategyCreate.tsx';
import MoreVert from '@mui/icons-material/MoreVert';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import useToast from 'hooks/useToast';
import { useReleasePlansApi } from 'hooks/api/actions/useReleasePlansApi/useReleasePlansApi';
import { useReleasePlans } from 'hooks/api/getters/useReleasePlans/useReleasePlans';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { formatUnknownError } from 'utils/formatUnknownError';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ReleasePlanReviewDialog } from '../../FeatureView/FeatureOverview/ReleasePlan/ReleasePlanReviewDialog.tsx';
import { FeatureStrategyMenuCards } from './FeatureStrategyMenuCards/FeatureStrategyMenuCards.tsx';

interface IFeatureStrategyMenuProps {
    label: string;
    projectId: string;
    featureId: string;
    environmentId: string;
    variant?: IPermissionButtonProps['variant'];
    matchWidth?: boolean;
    size?: IPermissionButtonProps['size'];
    disableReason?: string;
}

const StyledStrategyMenu = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
}));

const StyledAdditionalMenuButton = styled(PermissionButton)(({ theme }) => ({
    minWidth: 0,
    width: theme.spacing(4.5),
    alignSelf: 'stretch',
    paddingBlock: 0,
}));

export const FeatureStrategyMenu = ({
    label,
    projectId,
    featureId,
    environmentId,
    variant,
    size,
    matchWidth,
    disableReason,
}: IFeatureStrategyMenuProps) => {
    const [isStrategyMenuDialogOpen, setIsStrategyMenuDialogOpen] =
        useState<boolean>(false);
    const [onlyReleasePlans, setOnlyReleasePlans] = useState<boolean>(false);
    const navigate = useNavigate();
    const { trackEvent } = usePlausibleTracker();
    const [selectedTemplate, setSelectedTemplate] =
        useState<IReleasePlanTemplate>();
    const [addReleasePlanOpen, setAddReleasePlanOpen] = useState(false);
    const dialogId = isStrategyMenuDialogOpen
        ? 'FeatureStrategyMenuDialog'
        : undefined;
    const { setToastApiError, setToastData } = useToast();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const { refetch } = useReleasePlans(projectId, featureId, environmentId);
    const { addReleasePlanToFeature } = useReleasePlansApi();
    const { isEnterprise } = useUiConfig();
    const displayReleasePlanButton = isEnterprise();
    const crProtected = isChangeRequestConfigured(environmentId);
    const newStrategyModalEnabled = useUiFlag('newStrategyModal');

    const onClose = () => {
        setIsStrategyMenuDialogOpen(false);
    };

    const openDefaultStrategyCreationModal = (event: React.SyntheticEvent) => {
        trackEvent('strategy-add', {
            props: {
                buttonTitle: label,
            },
        });
        navigate(createStrategyPath);
    };

    const openMoreStrategies = (event: React.SyntheticEvent) => {
        setOnlyReleasePlans(false);
        setIsStrategyMenuDialogOpen(true);
    };

    const openReleasePlans = (event: React.SyntheticEvent) => {
        setOnlyReleasePlans(true);
        setIsStrategyMenuDialogOpen(true);
    };

    const addReleasePlan = async (template: IReleasePlanTemplate) => {
        try {
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
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setAddReleasePlanOpen(false);
            setSelectedTemplate(undefined);
            onClose();
        }
    };

    const createStrategyPath = formatCreateStrategyPath(
        projectId,
        featureId,
        environmentId,
        'flexibleRollout',
        true,
    );

    return (
        <StyledStrategyMenu onClick={(event) => event.stopPropagation()}>
            <>
                {displayReleasePlanButton ? (
                    <PermissionButton
                        data-testid='ADD_TEMPLATE_BUTTON'
                        permission={CREATE_FEATURE_STRATEGY}
                        projectId={projectId}
                        environmentId={environmentId}
                        onClick={openReleasePlans}
                        aria-labelledby={dialogId}
                        variant='outlined'
                        sx={{ minWidth: matchWidth ? '282px' : 'auto' }}
                        disabled={Boolean(disableReason)}
                        tooltipProps={{
                            title: disableReason ? disableReason : undefined,
                        }}
                    >
                        Use template
                    </PermissionButton>
                ) : null}

                <PermissionButton
                    data-testid='ADD_STRATEGY_BUTTON'
                    permission={CREATE_FEATURE_STRATEGY}
                    projectId={projectId}
                    environmentId={environmentId}
                    onClick={openDefaultStrategyCreationModal}
                    aria-labelledby={dialogId}
                    variant={variant}
                    sx={{ minWidth: matchWidth ? '282px' : 'auto' }}
                    disabled={Boolean(disableReason)}
                    tooltipProps={{
                        title: disableReason ? disableReason : undefined,
                    }}
                >
                    {label}
                </PermissionButton>

                <StyledAdditionalMenuButton
                    permission={CREATE_FEATURE_STRATEGY}
                    projectId={projectId}
                    environmentId={environmentId}
                    onClick={openMoreStrategies}
                    variant='outlined'
                    hideLockIcon
                    disabled={Boolean(disableReason)}
                    tooltipProps={{
                        title: disableReason
                            ? disableReason
                            : 'More strategies',
                    }}
                >
                    <MoreVert />
                </StyledAdditionalMenuButton>
            </>
            <Dialog
                open={isStrategyMenuDialogOpen}
                onClose={onClose}
                maxWidth='md'
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                    },
                }}
            >
                {newStrategyModalEnabled ? (
                    <FeatureStrategyMenuCards
                        projectId={projectId}
                        featureId={featureId}
                        environmentId={environmentId}
                        onlyReleasePlans={onlyReleasePlans}
                        onAddReleasePlan={(template) => {
                            setSelectedTemplate(template);
                            addReleasePlan(template);
                        }}
                        onReviewReleasePlan={(template) => {
                            setSelectedTemplate(template);
                            setAddReleasePlanOpen(true);
                            onClose();
                        }}
                        onClose={onClose}
                    />
                ) : (
                    <LegacyFeatureStrategyMenuCards
                        projectId={projectId}
                        featureId={featureId}
                        environmentId={environmentId}
                        onlyReleasePlans={onlyReleasePlans}
                        onAddReleasePlan={(template) => {
                            setSelectedTemplate(template);
                            addReleasePlan(template);
                        }}
                        onReviewReleasePlan={(template) => {
                            setSelectedTemplate(template);
                            setAddReleasePlanOpen(true);
                            onClose();
                        }}
                        onClose={onClose}
                    />
                )}
            </Dialog>
            {selectedTemplate && (
                <ReleasePlanReviewDialog
                    open={addReleasePlanOpen}
                    setOpen={(open) => {
                        setAddReleasePlanOpen(open);
                        if (!open) {
                            setIsStrategyMenuDialogOpen(true);
                        }
                    }}
                    onConfirm={() => {
                        addReleasePlan(selectedTemplate);
                    }}
                    template={selectedTemplate}
                    projectId={projectId}
                    featureName={featureId}
                    environment={environmentId}
                    crProtected={crProtected}
                />
            )}
        </StyledStrategyMenu>
    );
};
