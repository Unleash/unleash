import { styled } from '@mui/material';
import { Markdown } from 'component/common/Markdown/Markdown';
import { useLocationSettings } from 'hooks/useLocationSettings';
import {
    formatDateHMS,
    formatDateYMDHMS,
    formatDateYMD,
} from 'utils/formatDate';
import type { TimelineEventGroup } from '../../EventTimeline';
import { EventTimelineEventCircle } from '../EventTimelineEventCircle';

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

const StyledTooltipItem = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));

const StyledEventTimelineEventCircle = styled(EventTimelineEventCircle)(
    ({ theme }) => ({
        marginTop: theme.spacing(0.5),
        height: theme.spacing(2.5),
        width: theme.spacing(2.5),
        transition: 'none',
        '& > svg': {
            height: theme.spacing(2),
        },
        '&:hover': {
            transform: 'none',
        },
    }),
);

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
            event.createdAt,
            locationSettings?.locale,
        );

        return (
            <>
                <StyledTooltipHeader>
                    <StyledTooltipTitle>{event.label}</StyledTooltipTitle>
                    <StyledDateTime>{eventDateTime}</StyledDateTime>
                </StyledTooltipHeader>
                <Markdown>{event.summary}</Markdown>
            </>
        );
    }

    const firstEvent = group[0];
    const eventDate = formatDateYMD(
        firstEvent.createdAt,
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
            {group.map((event) => (
                <StyledTooltipItem key={event.id}>
                    <StyledEventTimelineEventCircle group={[event]} />
                    <div>
                        <StyledDate>
                            {formatDateHMS(
                                event.createdAt,
                                locationSettings?.locale,
                            )}
                        </StyledDate>
                        <Markdown>{event.summary}</Markdown>
                    </div>
                </StyledTooltipItem>
            ))}
        </>
    );
};
