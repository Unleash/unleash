import { MenuItem, styled, TextField } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { useEffect, useMemo } from 'react';
import { timeSpanOptions } from '../EventTimelineProvider.tsx';
import { useEventTimelineContext } from '../EventTimelineContext.tsx';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';

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
    const { timeSpan, environment, setTimeSpan, setEnvironment } =
        useEventTimelineContext();
    const { environments } = useEnvironments();

    const activeEnvironments = useMemo(
        () => environments.filter(({ enabled }) => enabled),
        [environments],
    );

    useEffect(() => {
        if (activeEnvironments.length > 0 && !environment) {
            const defaultEnvironment =
                activeEnvironments.find(({ type }) => type === 'production') ||
                activeEnvironments[0];
            setEnvironment(defaultEnvironment);
        }
    }, [activeEnvironments]);

    const EnvironmentFilter = () => (
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
    );

    const TimeSpanFilter = () => (
        <StyledFilter
            select
            size='small'
            variant='outlined'
            value={timeSpan.key}
            onChange={(e) =>
                setTimeSpan(
                    timeSpanOptions.find(({ key }) => key === e.target.value) ||
                        timeSpanOptions[0],
                )
            }
        >
            {timeSpanOptions.map(({ key, label }) => (
                <MenuItem key={key} value={key}>
                    {label}
                </MenuItem>
            ))}
        </StyledFilter>
    );

    return (
        <>
            <StyledCol>
                <StyledTimelineEventsCount>
                    {totalEvents} event
                    {totalEvents === 1 ? '' : 's'}
                    <HelpIcon tooltip='These are key events per environment across all your projects. For more details, visit the event log.' />
                </StyledTimelineEventsCount>
            </StyledCol>
            <StyledCol>
                <TimeSpanFilter />
                <EnvironmentFilter />
            </StyledCol>
        </>
    );
};
