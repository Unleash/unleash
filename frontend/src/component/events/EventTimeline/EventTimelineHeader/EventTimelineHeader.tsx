import {
    IconButton,
    MenuItem,
    styled,
    TextField,
    Tooltip,
} from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { useEffect, useMemo } from 'react';
import { timeSpanOptions } from '../EventTimelineProvider';
import CloseIcon from '@mui/icons-material/Close';
import { useEventTimelineContext } from '../EventTimelineContext';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { EventTimelineHeaderTip } from './EventTimelineHeaderTip';
import { useUiFlag } from 'hooks/useUiFlag';

const StyledCol = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledFilter = styled(TextField)(({ theme }) => ({
    '& > div': {
        background: 'transparent',
        color: theme.palette.text.secondary,
        '& > .MuiSelect-select': {
            padding: theme.spacing(0.5, 4, 0.5, 1),
            background: 'transparent',
        },
        '& > fieldset': { borderColor: 'transparent' },
    },
}));

const StyledTimelineEventsCount = styled('span')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(0.25),
}));

interface IEventTimelineHeaderProps {
    totalEvents: number;
}

export const EventTimelineHeader = ({
    totalEvents,
}: IEventTimelineHeaderProps) => {
    const { timeSpan, environment, setOpen, setTimeSpan, setEnvironment } =
        useEventTimelineContext();
    const { environments } = useEnvironments();
    const showSignalsLink = useUiFlag('frontendHeaderRedesign');

    const activeEnvironments = useMemo(
        () => environments.filter(({ enabled }) => enabled),
        [environments],
    );
    const { trackEvent } = usePlausibleTracker();

    useEffect(() => {
        if (activeEnvironments.length > 0 && !environment) {
            const defaultEnvironment =
                activeEnvironments.find(({ type }) => type === 'production') ||
                activeEnvironments[0];
            setEnvironment(defaultEnvironment);
        }
    }, [activeEnvironments]);

    return (
        <>
            <StyledCol>
                <StyledTimelineEventsCount>
                    {totalEvents} event
                    {totalEvents === 1 ? '' : 's'}
                    <HelpIcon tooltip='These are key events per environment across all your projects. For more details, visit the event log.' />
                </StyledTimelineEventsCount>
                <StyledFilter
                    select
                    size='small'
                    variant='outlined'
                    value={timeSpan.key}
                    onChange={(e) =>
                        setTimeSpan(
                            timeSpanOptions.find(
                                ({ key }) => key === e.target.value,
                            ) || timeSpanOptions[0],
                        )
                    }
                >
                    {timeSpanOptions.map(({ key, label }) => (
                        <MenuItem key={key} value={key}>
                            {label}
                        </MenuItem>
                    ))}
                </StyledFilter>
            </StyledCol>
            <StyledCol>
                {showSignalsLink && <EventTimelineHeaderTip />}
                <ConditionallyRender
                    condition={Boolean(environment) && environments.length > 0}
                    show={() => (
                        <StyledFilter
                            select
                            size='small'
                            variant='outlined'
                            value={environment!.name}
                            onChange={(e) =>
                                setEnvironment(
                                    environments.find(
                                        ({ name }) => name === e.target.value,
                                    ) || environments[0],
                                )
                            }
                        >
                            {environments.map(({ name }) => (
                                <MenuItem key={name} value={name}>
                                    {name}
                                </MenuItem>
                            ))}
                        </StyledFilter>
                    )}
                />
                <Tooltip title='Hide event timeline' arrow>
                    <IconButton
                        aria-label='close'
                        size='small'
                        onClick={() => {
                            trackEvent('event-timeline', {
                                props: {
                                    eventType: 'close',
                                },
                            });
                            setOpen(false);
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Tooltip>
            </StyledCol>
        </>
    );
};
