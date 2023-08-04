import {
    IChangeRequestDeleteSegment,
    IChangeRequestUpdateSegment,
} from 'component/changeRequest/changeRequest.types';
import { FC } from 'react';
import { formatStrategyName } from 'utils/strategyNames';
import EventDiff from 'component/events/EventDiff/EventDiff';
import omit from 'lodash.omit';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { Typography, styled } from '@mui/material';
import { textTruncated } from 'themes/themeStyles';
import { ISegment } from '../../../interfaces/segment';

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

export const SegmentDiff: FC<{
    change: IChangeRequestUpdateSegment | IChangeRequestDeleteSegment;
    currentSegment?: ISegment;
}> = ({ change, currentSegment }) => {
    const changeRequestStrategy =
        change.action === 'deleteSegment' ? undefined : change.payload;

    return (
        <StyledCodeSection>
            <EventDiff
                entry={{
                    preData: omit(currentSegment, 'sortOrder'),
                    data: changeRequestStrategy,
                }}
            />
        </StyledCodeSection>
    );
};

export const SegmentName: FC<{
    change: IChangeRequestUpdateSegment | IChangeRequestDeleteSegment;
}> = ({ change }) => {
    return (
        <>
            <Truncated>
                <Typography component="span">{change.payload.name}</Typography>
            </Truncated>
        </>
    );
};

interface IStrategyTooltipLinkProps {
    change: IChangeRequestUpdateSegment | IChangeRequestDeleteSegment;
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

export const SegmentTooltipLink: FC<IStrategyTooltipLinkProps> = ({
    change,
    children,
}) => (
    <StyledContainer>
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
        </Truncated>
    </StyledContainer>
);
