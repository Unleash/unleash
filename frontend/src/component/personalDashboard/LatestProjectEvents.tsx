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
    display: 'flex',
    gap: theme.spacing(2),
    listStyleType: 'none',
    padding: 0,
    marginBottom: theme.spacing(4),
}));

const BoldToNormal = ({ children }: HTMLAttributes<HTMLElement>) => children;

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
                        <Markdown components={{ strong: BoldToNormal }}>
                            {event.summary ||
                                'No preview available for this event'}
                        </Markdown>
                    </Event>
                );
            })}
        </Events>
    );
};
