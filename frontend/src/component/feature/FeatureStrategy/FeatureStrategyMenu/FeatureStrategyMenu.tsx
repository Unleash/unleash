import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PermissionButton, {
    type IPermissionButtonProps,
} from 'component/common/PermissionButton/PermissionButton';
import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { Popover, styled } from '@mui/material';
import { FeatureStrategyMenuCards } from './FeatureStrategyMenuCards/FeatureStrategyMenuCards';
import { formatCreateStrategyPath } from '../FeatureStrategyCreate/FeatureStrategyCreate';
import MoreVert from '@mui/icons-material/MoreVert';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import useToast from 'hooks/useToast';
import { ReleasePlanAddDialog } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlanAddDialog';
import { useReleasePlansApi } from 'hooks/api/actions/useReleasePlansApi/useReleasePlansApi';
import { useReleasePlans } from 'hooks/api/getters/useReleasePlans/useReleasePlans';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useUiFlag } from 'hooks/useUiFlag';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { OldFeatureStrategyMenuCards } from './FeatureStrategyMenuCards/OldFeatureStrategyMenuCards';

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
    const [anchor, setAnchor] = useState<Element>();
    const [onlyReleasePlans, setOnlyReleasePlans] = useState<boolean>(false);
    const navigate = useNavigate();
    const { trackEvent } = usePlausibleTracker();
    const [selectedTemplate, setSelectedTemplate] =
        useState<IReleasePlanTemplate>();
    const [addReleasePlanOpen, setAddReleasePlanOpen] = useState(false);
    const isPopoverOpen = Boolean(anchor);
    const popoverId = isPopoverOpen ? 'FeatureStrategyMenuPopover' : undefined;
    const { setToastApiError, setToastData } = useToast();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const { refetch } = useReleasePlans(projectId, featureId, environmentId);
    const { addReleasePlanToFeature } = useReleasePlansApi();
    const { isOss } = useUiConfig();
    const releasePlansEnabled = useUiFlag('releasePlans');
    const newStrategyDropdownEnabled = useUiFlag('newStrategyDropdown');
    const displayReleasePlanButton = !isOss() && releasePlansEnabled;
    const crProtected =
        releasePlansEnabled && isChangeRequestConfigured(environmentId);

    const onClose = () => {
        setAnchor(undefined);
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
        setAnchor(event.currentTarget);
    };

    const openReleasePlans = (event: React.SyntheticEvent) => {
        setOnlyReleasePlans(true);
        setAnchor(event.currentTarget);
    };

    const addReleasePlan = async () => {
        if (!selectedTemplate) return;

        try {
            if (crProtected) {
                await addChange(projectId, environmentId, {
                    feature: featureId,
                    action: 'addReleasePlan',
                    payload: {
                        templateId: selectedTemplate.id,
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
                    selectedTemplate.id,
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
                    plan: selectedTemplate.name,
                },
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setAddReleasePlanOpen(false);
            setSelectedTemplate(undefined);
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
            {displayReleasePlanButton ? (
                <PermissionButton
                    data-testid='ADD_TEMPLATE_BUTTON'
                    permission={CREATE_FEATURE_STRATEGY}
                    projectId={projectId}
                    environmentId={environmentId}
                    onClick={openReleasePlans}
                    aria-labelledby={popoverId}
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
                aria-labelledby={popoverId}
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
                    title: disableReason ? disableReason : 'More strategies',
                }}
            >
                <MoreVert />
            </StyledAdditionalMenuButton>
            <Popover
                id={popoverId}
                open={isPopoverOpen}
                anchorEl={anchor}
                onClose={onClose}
                onClick={onClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: (theme) => ({
                        width: 'auto',
                        maxWidth: '95vw',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                    }),
                }}
                disableScrollLock={true}
            >
                {newStrategyDropdownEnabled ? (
                    <FeatureStrategyMenuCards
                        projectId={projectId}
                        featureId={featureId}
                        environmentId={environmentId}
                        onlyReleasePlans={onlyReleasePlans}
                        onAddReleasePlan={(template) => {
                            setSelectedTemplate(template);
                            setAddReleasePlanOpen(true);
                        }}
                        onClose={onClose}
                    />
                ) : (
                    <OldFeatureStrategyMenuCards
                        projectId={projectId}
                        featureId={featureId}
                        environmentId={environmentId}
                        onlyReleasePlans={onlyReleasePlans}
                        onAddReleasePlan={(template) => {
                            setSelectedTemplate(template);
                            setAddReleasePlanOpen(true);
                        }}
                    />
                )}
            </Popover>
            {selectedTemplate && (
                <ReleasePlanAddDialog
                    open={addReleasePlanOpen}
                    setOpen={setAddReleasePlanOpen}
                    onConfirm={addReleasePlan}
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
