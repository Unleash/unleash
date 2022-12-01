import {
    IChangeRequestAddStrategy,
    IChangeRequestDeleteStrategy,
    IChangeRequestUpdateStrategy,
} from '../../changeRequest.types';
import React, { FC } from 'react';
import {
    formatStrategyName,
    GetFeatureStrategyIcon,
} from '../../../../utils/strategyNames';
import { Popover, Typography } from '@mui/material';
import { useFeature } from '../../../../hooks/api/getters/useFeature/useFeature';
import { StyledCodeSection } from '../../../events/EventCard/EventCard';
import EventDiff from '../../../events/EventDiff/EventDiff';

const useCurrentStrategy = (
    change:
        | IChangeRequestAddStrategy
        | IChangeRequestUpdateStrategy
        | IChangeRequestDeleteStrategy,
    project: string,
    feature: string,
    environmentName: string
) => {
    const currentFeature = useFeature(project, feature);
    const currentStrategy = currentFeature.feature?.environments
        .find(environment => environment.name === environmentName)
        ?.strategies.find(
            strategy =>
                'id' in change.payload && strategy.id === change.payload.id
        );
    return currentStrategy;
};

export const PopoverDiff: FC<{
    change:
        | IChangeRequestAddStrategy
        | IChangeRequestUpdateStrategy
        | IChangeRequestDeleteStrategy;
    project: string;
    feature: string;
    environmentName: string;
}> = ({ change, project, feature, environmentName }) => {
    const currentStrategy = useCurrentStrategy(
        change,
        project,
        feature,
        environmentName
    );
    const changeRequestStrategy =
        change.action === 'deleteStrategy' ? undefined : change.payload;

    return (
        <StyledCodeSection>
            <EventDiff
                entry={{
                    preData: currentStrategy,
                    data: changeRequestStrategy,
                }}
            />
        </StyledCodeSection>
    );
};
interface ICodeSnippetPopoverProps {
    change:
        | IChangeRequestAddStrategy
        | IChangeRequestUpdateStrategy
        | IChangeRequestDeleteStrategy;
}

// based on: https://mui.com/material-ui/react-popover/#mouse-over-interaction
export const CodeSnippetPopover: FC<ICodeSnippetPopoverProps> = ({
    change,
    children,
}) => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <>
            <GetFeatureStrategyIcon strategyName={change.payload.name} />

            <Typography
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
            >
                {formatStrategyName(change.payload.name)}
            </Typography>
            <Popover
                id={String(change.id)}
                sx={{
                    pointerEvents: 'none',
                }}
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                onClose={handlePopoverClose}
                disableRestoreFocus
            >
                {children}
            </Popover>
        </>
    );
};
