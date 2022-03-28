import PermissionButton, {
    IPermissionButtonProps,
} from 'component/common/PermissionButton/PermissionButton';
import React, { useState } from 'react';
import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { Popover } from '@material-ui/core';
import { FeatureStrategyMenuCards } from './FeatureStrategyMenuCards/FeatureStrategyMenuCards';

interface IFeatureStrategyMenuProps {
    label: string;
    projectId: string;
    featureId: string;
    environmentId: string;
    variant?: IPermissionButtonProps['variant'];
}

export const FeatureStrategyMenu = ({
    label,
    projectId,
    featureId,
    environmentId,
    variant,
}: IFeatureStrategyMenuProps) => {
    const [anchor, setAnchor] = useState<Element>();
    const isPopoverOpen = Boolean(anchor);
    const popoverId = isPopoverOpen ? 'FeatureStrategyMenuPopover' : undefined;

    const onClose = () => {
        setAnchor(undefined);
    };

    const onClick = (event: React.SyntheticEvent) => {
        setAnchor(event.currentTarget);
    };

    return (
        <div onClick={event => event.stopPropagation()}>
            <PermissionButton
                permission={CREATE_FEATURE_STRATEGY}
                projectId={projectId}
                environmentId={environmentId}
                onClick={onClick}
                aria-describedby={popoverId}
                variant={variant}
            >
                {label}
            </PermissionButton>
            <Popover
                id={popoverId}
                open={isPopoverOpen}
                anchorEl={anchor}
                onClose={onClose}
                onClick={onClose}
            >
                <FeatureStrategyMenuCards
                    projectId={projectId}
                    featureId={featureId}
                    environmentId={environmentId}
                />
            </Popover>
        </div>
    );
};
