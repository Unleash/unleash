import { styled } from '@mui/material';
import { Markdown } from 'component/common/Markdown/Markdown';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMDHMS } from 'utils/formatDate';
import type { EnrichedEvent } from '../../EventTimeline';

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

interface IEventTimelineEventTooltipProps {
    event: EnrichedEvent;
}

export const EventTimelineEventTooltip = ({
    event,
}: IEventTimelineEventTooltipProps) => {
    const { locationSettings } = useLocationSettings();
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
};
