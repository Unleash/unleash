import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PermissionButton, {
    IPermissionButtonProps,
} from 'component/common/PermissionButton/PermissionButton';
import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { Popover, styled } from '@mui/material';
import { FeatureStrategyMenuCards } from './FeatureStrategyMenuCards/FeatureStrategyMenuCards';
import { formatCreateStrategyPath } from '../FeatureStrategyCreate/FeatureStrategyCreate';
import { MoreVert } from '@mui/icons-material';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

interface IFeatureStrategyMenuProps {
    label: string;
    projectId: string;
    featureId: string;
    environmentId: string;
    variant?: IPermissionButtonProps['variant'];
    matchWidth?: boolean;
    size?: IPermissionButtonProps['size'];
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
}: IFeatureStrategyMenuProps) => {
    const [anchor, setAnchor] = useState<Element>();
    const navigate = useNavigate();
    const { trackEvent } = usePlausibleTracker();
    const isPopoverOpen = Boolean(anchor);
    const popoverId = isPopoverOpen ? 'FeatureStrategyMenuPopover' : undefined;

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

    const createStrategyPath = formatCreateStrategyPath(
        projectId,
        featureId,
        environmentId,
        'flexibleRollout',
        true
    );

    return (
        <StyledStrategyMenu onClick={event => event.stopPropagation()}>
            <PermissionButton
                permission={CREATE_FEATURE_STRATEGY}
                projectId={projectId}
                environmentId={environmentId}
                onClick={openDefaultStrategyCreationModal}
                aria-labelledby={popoverId}
                variant={variant}
                size={size}
                sx={{ minWidth: matchWidth ? '282px' : 'auto' }}
            >
                {label}
            </PermissionButton>

            <StyledAdditionalMenuButton
                permission={CREATE_FEATURE_STRATEGY}
                projectId={projectId}
                environmentId={environmentId}
                onClick={openMoreStrategies}
                aria-labelledby={popoverId}
                variant="outlined"
                size={size}
                hideLockIcon
                tooltipProps={{
                    title: 'More strategies',
                }}
            >
                <MoreVert sx={theme => ({ margin: theme.spacing(0.25, 0) })} />
            </StyledAdditionalMenuButton>
            <Popover
                id={popoverId}
                open={isPopoverOpen}
                anchorEl={anchor}
                onClose={onClose}
                onClick={onClose}
                PaperProps={{
                    sx: theme => ({
                        paddingBottom: theme.spacing(1),
                    }),
                }}
            >
                <FeatureStrategyMenuCards
                    projectId={projectId}
                    featureId={featureId}
                    environmentId={environmentId}
                />
            </Popover>
        </StyledStrategyMenu>
    );
};
