import type { FC } from 'react';
import { Markdown } from '../common/Markdown/Markdown';
import type { PersonalDashboardProjectDetailsSchema } from '../../openapi';
import { UserAvatar } from '../common/UserAvatar/UserAvatar';
import { Typography, styled } from '@mui/material';

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

const TitleContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
    alignItems: 'center',
}));

const ActionBox = styled('article')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    display: 'flex',
    gap: theme.spacing(3),
    flexDirection: 'column',
}));

export const LatestProjectEvents: FC<{
    latestEvents: PersonalDashboardProjectDetailsSchema['latestEvents'];
}> = ({ latestEvents }) => {
    return (
        <ActionBox>
            <TitleContainer>
                <Typography
                    sx={{
                        fontWeight: 'bold',
                    }}
                    component='h4'
                >
                    Latest Events
                </Typography>
            </TitleContainer>
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
        </ActionBox>
    );
};
