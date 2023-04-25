import {
    IChangeRequestAddStrategy,
    IChangeRequestDeleteStrategy,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';
import { FC } from 'react';
import {
    formatStrategyName,
    GetFeatureStrategyIcon,
} from 'utils/strategyNames';
import EventDiff from 'component/events/EventDiff/EventDiff';
import omit from 'lodash.omit';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { Typography, styled } from '@mui/material';
import { IFeatureStrategy } from 'interfaces/strategy';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import theme from 'themes/theme';

const StyledCodeSection = styled('div')(({ theme }) => ({
    overflowX: 'auto',
    '& code': {
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        lineHeight: 1.5,
        fontSize: theme.fontSizes.smallBody,
    },
}));

export const StrategyDiff: FC<{
    change:
        | IChangeRequestAddStrategy
        | IChangeRequestUpdateStrategy
        | IChangeRequestDeleteStrategy;
    currentStrategy?: IFeatureStrategy;
}> = ({ change, currentStrategy }) => {
    const changeRequestStrategy =
        change.action === 'deleteStrategy' ? undefined : change.payload;

    return (
        <StyledCodeSection>
            <EventDiff
                entry={{
                    preData: omit(currentStrategy, 'sortOrder'),
                    data: changeRequestStrategy,
                }}
            />
        </StyledCodeSection>
    );
};
interface IStrategyTooltipLinkProps {
    change:
        | IChangeRequestAddStrategy
        | IChangeRequestUpdateStrategy
        | IChangeRequestDeleteStrategy;
    previousTitle?: string;
}

export const StrategyTooltipLink: FC<IStrategyTooltipLinkProps> = ({
    change,
    previousTitle,
    children,
}) => (
    <>
        <GetFeatureStrategyIcon strategyName={change.payload.name} />
        <ConditionallyRender
            condition={previousTitle !== change.payload.title}
            show={
                <>
                    <Typography component="s" color="action.disabled">
                        {previousTitle ||
                            formatStrategyName(change.payload.name)}
                    </Typography>{' '}
                </>
            }
        />
        <TooltipLink
            tooltip={children}
            tooltipProps={{
                maxWidth: 500,
                maxHeight: 600,
            }}
        >
            {change.payload.title || formatStrategyName(change.payload.name)}
        </TooltipLink>
    </>
);
