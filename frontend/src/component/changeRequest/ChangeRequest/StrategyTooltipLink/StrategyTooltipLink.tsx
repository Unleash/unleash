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

export const StrategyName: FC<{
    change:
        | IChangeRequestAddStrategy
        | IChangeRequestUpdateStrategy
        | IChangeRequestDeleteStrategy;
    previousTitle: string | undefined;
}> = ({ change, previousTitle }) => {
    return (
        <>
            <ConditionallyRender
                condition={Boolean(
                    previousTitle && previousTitle !== change.payload.title
                )}
                show={
                    <Truncated>
                        <Typography component="span" color="text.secondary">
                            {previousTitle ||
                                formatStrategyName(change.payload.name)}
                        </Typography>{' '}
                    </Truncated>
                }
            />
            <Truncated>
                <Typography component="span">{change.payload.title}</Typography>
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
            {<StrategyName change={change} previousTitle={previousTitle} />}
        </Truncated>
    </StyledContainer>
);
