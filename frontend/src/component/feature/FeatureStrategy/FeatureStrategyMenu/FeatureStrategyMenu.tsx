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
import { useUiFlag } from 'hooks/useUiFlag';
import { ReleasePlanAddChangeRequestDialog } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ChangeRequest/ReleasePlanAddChangeRequestDialog';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import useToast from 'hooks/useToast';

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

const StyledStrategyMenu = styled('div')({
    flexShrink: 0,
});

const StyledAdditionalMenuButton = styled(PermissionButton)(({ theme }) => ({
    minWidth: 0,
    width: theme.spacing(4.5),
    alignItems: 'center',
    justifyContent: 'center',
    align: 'center',
    flexDirection: 'column',
    marginLeft: theme.spacing(1),
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
    const navigate = useNavigate();
    const { trackEvent } = usePlausibleTracker();
    const [templateForChangeRequestDialog, setTemplateForChangeRequestDialog] =
        useState<IReleasePlanTemplate | undefined>();
    const isPopoverOpen = Boolean(anchor);
    const popoverId = isPopoverOpen ? 'FeatureStrategyMenuPopover' : undefined;
    const flagOverviewRedesignEnabled = useUiFlag('flagOverviewRedesign');
    const { setToastData } = useToast();
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);

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
        setAnchor(event.currentTarget);
    };

    const addReleasePlanToChangeRequest = async () => {
        addChange(projectId, environmentId, {
            feature: featureId,
            action: 'addReleasePlan',
            payload: {
                templateId: templateForChangeRequestDialog?.id,
            },
        });

        refetchChangeRequests();

        setToastData({
            type: 'success',
            text: 'Added to draft',
        });

        setTemplateForChangeRequestDialog(undefined);
    };

    const createStrategyPath = formatCreateStrategyPath(
        projectId,
        featureId,
        environmentId,
        'flexibleRollout',
        true,
    );

    if (flagOverviewRedesignEnabled) {
        return (
            <StyledStrategyMenu onClick={(event) => event.stopPropagation()}>
                <PermissionButton
                    data-testid='ADD_STRATEGY_BUTTON'
                    permission={CREATE_FEATURE_STRATEGY}
                    projectId={projectId}
                    environmentId={environmentId}
                    onClick={openMoreStrategies}
                    aria-labelledby={popoverId}
                    variant={variant}
                    size={size}
                    sx={{ minWidth: matchWidth ? '282px' : 'auto' }}
                    disabled={Boolean(disableReason)}
                    tooltipProps={{
                        title: disableReason ? disableReason : undefined,
                    }}
                >
                    {label}
                </PermissionButton>
                <Popover
                    id={popoverId}
                    open={isPopoverOpen}
                    anchorEl={anchor}
                    onClose={onClose}
                    onClick={onClose}
                    PaperProps={{
                        sx: (theme) => ({
                            paddingBottom: theme.spacing(1),
                        }),
                    }}
                >
                    <FeatureStrategyMenuCards
                        projectId={projectId}
                        featureId={featureId}
                        environmentId={environmentId}
                        setTemplateForChangeRequestDialog={
                            setTemplateForChangeRequestDialog
                        }
                    />
                </Popover>
            </StyledStrategyMenu>
        );
    }

    return (
        <StyledStrategyMenu onClick={(event) => event.stopPropagation()}>
            <PermissionButton
                data-testid='ADD_STRATEGY_BUTTON'
                permission={CREATE_FEATURE_STRATEGY}
                projectId={projectId}
                environmentId={environmentId}
                onClick={openDefaultStrategyCreationModal}
                aria-labelledby={popoverId}
                variant={variant}
                size={size}
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
                size={size}
                hideLockIcon
                disabled={Boolean(disableReason)}
                tooltipProps={{
                    title: disableReason ? disableReason : 'More strategies',
                }}
            >
                <MoreVert
                    sx={(theme) => ({ margin: theme.spacing(0.25, 0) })}
                />
            </StyledAdditionalMenuButton>
            <Popover
                id={popoverId}
                open={isPopoverOpen}
                anchorEl={anchor}
                onClose={onClose}
                onClick={onClose}
                PaperProps={{
                    sx: (theme) => ({
                        paddingBottom: theme.spacing(1),
                    }),
                }}
            >
                <FeatureStrategyMenuCards
                    projectId={projectId}
                    featureId={featureId}
                    environmentId={environmentId}
                    setTemplateForChangeRequestDialog={
                        setTemplateForChangeRequestDialog
                    }
                />
            </Popover>
            <ReleasePlanAddChangeRequestDialog
                onConfirm={addReleasePlanToChangeRequest}
                onClosing={() => setTemplateForChangeRequestDialog(undefined)}
                isOpen={Boolean(templateForChangeRequestDialog)}
                featureId={featureId}
                environmentId={environmentId}
                releaseTemplate={templateForChangeRequestDialog}
            />
        </StyledStrategyMenu>
    );
};
