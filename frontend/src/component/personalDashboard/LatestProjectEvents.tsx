import type { FC } from 'react';
import { Markdown } from '../common/Markdown/Markdown';
import type { PersonalDashboardProjectDetailsSchema } from '../../openapi';
import { UserAvatar } from '../common/UserAvatar/UserAvatar';
import { Typography, styled } from '@mui/material';
import { formatDateYMDHM } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';

const Events = styled('ul')(({ theme }) => ({
    padding: 0,
    alignItems: 'flex-start',
    display: 'flex',
    flexFlow: 'column nowrap',
    gap: theme.spacing(2),
}));

const Event = styled('li')(({ theme }) => ({
    listStyleType: 'none',
    padding: theme.spacing(0),
    display: 'inline-flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    fontSize: theme.typography.body2.fontSize,

    '*': {
        fontWeight: 'normal',
    },
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

const Timestamp = styled('time')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.fontSize,
    marginBottom: theme.spacing(1),
}));

export const LatestProjectEvents: FC<{
    latestEvents: PersonalDashboardProjectDetailsSchema['latestEvents'];
}> = ({ latestEvents }) => {
    const { locationSettings } = useLocationSettings();
    return (
        <ActionBox>
            <TitleContainer>
                <Typography
                    sx={{
                        fontWeight: 'bold',
                    }}
                    component='h4'
                >
                    Latest events
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
                            <div>
                                <Timestamp dateTime={event.createdAt}>
                                    {formatDateYMDHM(
                                        event.createdAt,
                                        locationSettings.locale,
                                    )}
                                </Timestamp>
                                <Markdown>
                                    {event.summary ||
                                        'No preview available for this event'}
                                </Markdown>
                            </div>
                        </Event>
                    );
                })}
            </Events>
        </ActionBox>
    );
};
