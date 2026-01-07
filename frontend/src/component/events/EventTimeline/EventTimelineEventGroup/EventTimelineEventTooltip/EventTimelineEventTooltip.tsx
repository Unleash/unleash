import { styled } from '@mui/material';
import { Markdown } from 'component/common/Markdown/Markdown';
import type { HTMLAttributes } from 'react';
import { useLocationSettings } from 'hooks/useLocationSettings';
import {
    formatDateHMS,
    formatDateYMDHMS,
    formatDateYMD,
} from 'utils/formatDate';
import type { TimelineEventGroup } from '../../EventTimeline.tsx';
import { EventTimelineEventCircle } from '../EventTimelineEventCircle.tsx';

const StyledTooltipHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
    gap: theme.spacing(2),
    flexWrap: 'wrap',
}));

const StyledTooltipTitle = styled('div')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSizes.smallBody,
    wordBreak: 'break-word',
    flex: 1,
}));

const StyledDateTime = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',
}));

const StyledDate = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',
}));

const StyledTooltipItemList = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StyledTooltipItem = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
}));

const StyledEventTimelineEventCircle = styled(EventTimelineEventCircle)(
    ({ theme }) => ({
        flexShrink: 0,
        marginTop: theme.spacing(0.125),
        height: theme.spacing(2.5),
        width: theme.spacing(2.5),
        transition: 'none',
        '& > svg': {
            height: theme.spacing(1.75),
        },
        '& > span': {
            fontSize: theme.fontSizes.smallBody,
        },
        '&:hover': {
            transform: 'none',
        },
    }),
);

const BoldToNormal = ({ children }: HTMLAttributes<HTMLElement>) => children;

interface IEventTimelineEventTooltipProps {
    group: TimelineEventGroup;
}

export const EventTimelineEventTooltip = ({
    group,
}: IEventTimelineEventTooltipProps) => {
    const { locationSettings } = useLocationSettings();

    if (group.length === 1) {
        const event = group[0];
        const eventDateTime = formatDateYMDHMS(
            event.timestamp,
            locationSettings?.locale,
        );

        return (
            <>
                <StyledTooltipHeader>
                    <StyledTooltipTitle>{event.label}</StyledTooltipTitle>
                    <StyledDateTime>{eventDateTime}</StyledDateTime>
                </StyledTooltipHeader>
                <Markdown components={{ strong: BoldToNormal }}>
                    {event.summary}
                </Markdown>
            </>
        );
    }

    const firstEvent = group[0];
    const eventDate = formatDateYMD(
        firstEvent.timestamp,
        locationSettings?.locale,
    );

    return (
        <>
            <StyledTooltipHeader>
                <StyledTooltipTitle>
                    {group.length} events occurred
                </StyledTooltipTitle>
                <StyledDate>{eventDate}</StyledDate>
            </StyledTooltipHeader>
            <StyledTooltipItemList>
                {group.map((event) => (
                    <StyledTooltipItem key={event.id}>
                        <StyledEventTimelineEventCircle group={[event]} />
                        <div>
                            <StyledDate>
                                {formatDateHMS(
                                    event.timestamp,
                                    locationSettings?.locale,
                                )}
                            </StyledDate>
                            <Markdown components={{ strong: BoldToNormal }}>
                                {event.summary}
                            </Markdown>
                        </div>
                    </StyledTooltipItem>
                ))}
            </StyledTooltipItemList>
        </>
    );
};
