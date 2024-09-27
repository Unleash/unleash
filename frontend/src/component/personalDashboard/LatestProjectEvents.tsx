import type { FC } from 'react';
import type { PersonalDashboardProjectDetailsSchema } from '../../openapi';
import { Markdown } from '../common/Markdown/Markdown';

export const LatestProjectEvents: FC<{
    latestEvents: PersonalDashboardProjectDetailsSchema['latestEvents'];
}> = ({ latestEvents }) => {
    return (
        <ul>
            {latestEvents.map((event) => {
                return (
                    <li key={event.summary}>
                        <Markdown>
                            {event.summary ||
                                'No preview available for this event'}
                        </Markdown>
                    </li>
                );
            })}
        </ul>
    );
};
