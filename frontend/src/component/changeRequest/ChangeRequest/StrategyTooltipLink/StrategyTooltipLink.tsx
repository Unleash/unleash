import type {
    IChangeRequestAddStrategy,
    IChangeRequestDeleteStrategy,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';
import type React from 'react';
import type { FC } from 'react';
import {
    formatStrategyName,
    GetFeatureStrategyIcon,
} from 'utils/strategyNames';
import EventDiff from 'component/events/EventDiff/EventDiff';
import omit from 'lodash.omit';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { Typography, styled } from '@mui/material';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { textTruncated } from 'themes/themeStyles';
import { NameWithChangeInfo } from '../NameWithChangeInfo/NameWithChangeInfo';

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
                    data: omit(changeRequestStrategy, 'snapshot'),
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
    children?: React.ReactNode;
}

const StyledContainer: FC<{ children?: React.ReactNode }> = styled('div')(
    ({ theme }) => ({
        display: 'grid',
        gridAutoFlow: 'column',
        gridTemplateColumns: 'auto 1fr',
        gap: theme.spacing(1),
        alignItems: 'center',
    }),
);

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
                <Typography component='span'>
                    {formatStrategyName(change.payload.name)}
                </Typography>
            </TooltipLink>
            <NameWithChangeInfo
                newName={change.payload.title}
                previousName={previousTitle}
            />
        </Truncated>
    </StyledContainer>
);
