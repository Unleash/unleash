import type { FC } from 'react';
import { Markdown } from '../common/Markdown/Markdown';
import type { PersonalDashboardProjectDetailsSchema } from '../../openapi';
import { UserAvatar } from '../common/UserAvatar/UserAvatar';
import { Typography, styled } from '@mui/material';
import { formatDateYMDHM } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { ActionBox } from './ActionBox';

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

const Timestamp = styled('time')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.fontSize,
    marginBottom: theme.spacing(1),
}));

const StyledUserAvatar = styled(UserAvatar)(({ theme }) => ({
    marginTop: theme.spacing(0.5),
}));

const StyledMarkdown = styled(Markdown)(({ theme }) => ({
    wordBreak: 'break-word',
}));

const BreakLongWordsFallback = styled('div')({
    wordBreak: 'break-all',
});

export const LatestProjectEvents: FC<{
    latestEvents: PersonalDashboardProjectDetailsSchema['latestEvents'];
}> = ({ latestEvents }) => {
    const { locationSettings } = useLocationSettings();
    return (
        <ActionBox
            title={
                <Typography
                    sx={{
                        fontWeight: 'bold',
                    }}
                    component='h4'
                >
                    Latest events
                </Typography>
            }
        >
            <Events>
                {latestEvents.map((event) => {
                    return (
                        <Event key={event.id}>
                            <StyledUserAvatar src={event.createdByImageUrl} />
                            <div>
                                <Timestamp dateTime={event.createdAt}>
                                    {formatDateYMDHM(
                                        event.createdAt,
                                        locationSettings.locale,
                                    )}
                                </Timestamp>
                                <BreakLongWordsFallback>
                                    <StyledMarkdown>
                                        {event.summary ||
                                            'No preview available for this event'}
                                    </StyledMarkdown>
                                </BreakLongWordsFallback>
                            </div>
                        </Event>
                    );
                })}
            </Events>
        </ActionBox>
    );
};
