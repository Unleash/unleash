import { useLocationSettings } from 'hooks/useLocationSettings';
import type { EventSchema } from 'openapi';
import { formatDateYMDHMS } from 'utils/formatDate';

interface IEventTimelineEventTooltipProps {
    event: EventSchema;
}

export const EventTimelineEventTooltip = ({
    event,
}: IEventTimelineEventTooltipProps) => {
    const { locationSettings } = useLocationSettings();
    const eventDateTime = formatDateYMDHMS(
        event.createdAt,
        locationSettings?.locale,
    );

    if (event.type === 'feature-environment-enabled') {
        return (
            <div>
                <small>{eventDateTime}</small>
                <p>
                    {event.createdBy} enabled {event.featureName} for the{' '}
                    {event.environment} environment in project {event.project}
                </p>
            </div>
        );
    }
    if (event.type === 'feature-environment-disabled') {
        return (
            <div>
                <small>{eventDateTime}</small>
                <p>
                    {event.createdBy} disabled {event.featureName} for the{' '}
                    {event.environment} environment in project {event.project}
                </p>
            </div>
        );
    }

    return (
        <div>
            <div>{eventDateTime}</div>
            <div>{event.createdBy}</div>
            <div>{event.type}</div>
            <div>{event.featureName}</div>
            <div>{event.environment}</div>
        </div>
    );
};
