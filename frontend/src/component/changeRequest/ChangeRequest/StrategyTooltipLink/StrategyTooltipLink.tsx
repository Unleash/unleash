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
import { textTruncated } from 'themes/themeStyles';

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

/// Test cases:

// 1. the strategy didn't have a title, but has one now: change.payload.title is defined and previousTitle is undefined or empty
// 2. the strategy had a title, but doesn't have one now: change.payload.title is undefined or empty and previousTitle is defined
// 3. the strategy had a title, and has a new one now: change.payload.title is defined and previousTitle is defined and they are different
// 4. the strategy had a title, and has the same one now: change.payload.title is defined and previousTitle is defined and they are the same
export const StrategyName: FC<{
    change:
        | IChangeRequestAddStrategy
        | IChangeRequestUpdateStrategy
        | IChangeRequestDeleteStrategy;
    previousTitle: string | undefined;
}> = ({ change, previousTitle }) => {
    const titleHasChanged = Boolean(
        previousTitle && previousTitle !== change.payload.title
    );

    const titleHasChangedOrBeenAdded =
        titleHasChanged || (!previousTitle && change.payload.title);

    return (
        <>
            <ConditionallyRender
                condition={titleHasChanged}
                show={
                    <Truncated>
                        <Typography component="del" color="text.secondary">
                            {previousTitle ||
                                formatStrategyName(change.payload.name)}
                        </Typography>
                    </Truncated>
                }
            />
            <Truncated>
                <Typography
                    component={titleHasChangedOrBeenAdded ? 'ins' : 'span'}
                >
                    {change.payload.title}
                </Typography>
            </Truncated>
        </>
    );
};

interface IStrategyTooltipLinkProps {
    change:
        | IChangeRequestAddStrategy
        | IChangeRequestUpdateStrategy
        | IChangeRequestDeleteStrategy;
    previousTitle?: string;
}

const StyledContainer: FC = styled('div')(({ theme }) => ({
    display: 'grid',
    gridAutoFlow: 'column',
    gridTemplateColumns: 'auto 1fr',
    gap: theme.spacing(1),
    alignItems: 'center',
}));

const Truncated = styled('div')(() => ({
    ...textTruncated,
    maxWidth: 500,
}));

export const StrategyTooltipLink: FC<IStrategyTooltipLinkProps> = ({
    change,
    previousTitle,
    children,
}) => (
    <StyledContainer>
        <GetFeatureStrategyIcon strategyName={change.payload.name} />
        <Truncated>
            <TooltipLink
                tooltip={children}
                tooltipProps={{
                    maxWidth: 500,
                    maxHeight: 600,
                }}
            >
                <Typography component="span">
                    {formatStrategyName(change.payload.name)}
                </Typography>
            </TooltipLink>
            <StrategyName change={change} previousTitle={previousTitle} />
        </Truncated>
    </StyledContainer>
);
