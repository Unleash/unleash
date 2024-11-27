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
    name: string;
    title?: string;
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

const ViewDiff = styled('span')(({ theme }) => ({
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(1),
}));

const Truncated = styled('div')(() => ({
    ...textTruncated,
    maxWidth: 500,
}));

export const StrategyTooltipLink: FC<IStrategyTooltipLinkProps> = ({
    name,
    title,
    previousTitle,
    children,
}) => {
    return (
        <StyledContainer>
            <GetFeatureStrategyIcon strategyName={name} />
            <Truncated>
                <Typography component='span'>
                    {formatStrategyName(name)}
                </Typography>
                <TooltipLink
                    tooltip={children}
                    tooltipProps={{
                        maxWidth: 500,
                        maxHeight: 600,
                    }}
                >
                    <ViewDiff>View Diff</ViewDiff>
                </TooltipLink>
                <NameWithChangeInfo
                    newName={title}
                    previousName={previousTitle}
                />
            </Truncated>
        </StyledContainer>
    );
};
