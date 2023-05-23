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
}) => {
    const titleHasChanged = Boolean(
        (previousTitle && previousTitle !== change.payload.title) ||
            (!previousTitle && change.payload.title)
    );
    const previousTitleOrDefault = () =>
        previousTitle || formatStrategyName(change.payload.name);

    return (
        <StyledContainer>
            <GetFeatureStrategyIcon strategyName={change.payload.name} />
            <Truncated>
                <ConditionallyRender
                    condition={titleHasChanged}
                    show={
                        <Truncated>
                            <Typography component="s" color="text.secondary">
                                {previousTitleOrDefault()}
                            </Typography>{' '}
                        </Truncated>
                    }
                />
                <Truncated>
                    <TooltipLink
                        tooltip={children}
                        tooltipProps={{
                            maxWidth: 500,
                            maxHeight: 600,
                        }}
                    >
                        <Typography component="span">
                            {change.payload.title ||
                                formatStrategyName(change.payload.name)}
                        </Typography>
                    </TooltipLink>
                </Truncated>
            </Truncated>
        </StyledContainer>
    );
};
