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
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
    // width: '100%',
}));

export const StrategyTooltipLink: FC<IStrategyTooltipLinkProps> = ({
    change,
    previousTitle,
    children,
}) => (
    <StyledContainer>
        <GetFeatureStrategyIcon strategyName={change.payload.name} />
        <ConditionallyRender
            condition={Boolean(
                previousTitle && previousTitle !== change.payload.title
            )}
            show={
                <>
                    <Typography
                        component="s"
                        color="text.secondary"
                        sx={{
                            ...textTruncated,
                            maxWidth: '100%',
                        }}
                    >
                        {previousTitle}
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
            <Typography
                component="span"
                sx={{
                    ...textTruncated,
                    maxWidth:
                        previousTitle === change.payload.title
                            ? '300px'
                            : '200px',
                    display: 'block',
                }}
            >
                {change.payload.title ||
                    formatStrategyName(change.payload.name)}
            </Typography>
        </TooltipLink>
    </StyledContainer>
);
