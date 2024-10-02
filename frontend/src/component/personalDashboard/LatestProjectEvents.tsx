import type { FC } from 'react';
import { Markdown } from '../common/Markdown/Markdown';
import type { PersonalDashboardProjectDetailsSchema } from '../../openapi';
import { UserAvatar } from '../common/UserAvatar/UserAvatar';
import { styled } from '@mui/material';

const Events = styled('ul')(({ theme }) => ({
    padding: 0,
    alignItems: 'flex-start',
}));

const Event = styled('li')(({ theme }) => ({
    listStyleType: 'none',
    padding: theme.spacing(0),
    display: 'inline-flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    marginBottom: theme.spacing(4),
}));

export const LatestProjectEvents: FC<{
    latestEvents: PersonalDashboardProjectDetailsSchema['latestEvents'];
}> = ({ latestEvents }) => {
    return (
        <Events>
            {latestEvents.map((event) => {
                return (
                    <Event key={event.id}>
                        <UserAvatar
                            src={event.createdByImageUrl}
                            sx={{ mt: 1 }}
                        />
                        <Markdown>
                            {event.summary ||
                                'No preview available for this event'}
                        </Markdown>
                    </Event>
                );
            })}
        </Events>
    );
};
