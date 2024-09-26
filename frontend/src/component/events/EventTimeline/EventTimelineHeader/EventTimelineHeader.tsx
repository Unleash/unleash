import { MenuItem, styled, TextField } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import type { IEnvironment } from 'interfaces/environments';
import { useEffect, useMemo } from 'react';
import { type TimeSpanOption, timeSpanOptions } from '../useEventTimeline';

const StyledCol = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledFilter = styled(TextField)(({ theme }) => ({
    color: theme.palette.text.secondary,
    '& > div': {
        background: 'transparent',
        '& > .MuiSelect-select': {
            padding: theme.spacing(0.5, 4, 0.5, 1),
            background: 'transparent',
        },
        '& > fieldset': { borderColor: 'transparent' },
    },
}));

interface IEventTimelineHeaderProps {
    totalEvents: number;
    timeSpan: TimeSpanOption;
    setTimeSpan: (timeSpan: TimeSpanOption) => void;
    environment: IEnvironment | undefined;
    setEnvironment: (environment: IEnvironment) => void;
}

export const EventTimelineHeader = ({
    totalEvents,
    timeSpan,
    setTimeSpan,
    environment,
    setEnvironment,
}: IEventTimelineHeaderProps) => {
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

    return (
        <>
            <StyledCol>
                <span>
                    {totalEvents} event
                    {totalEvents === 1 ? '' : 's'}
                </span>
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
                <ConditionallyRender
                    condition={Boolean(environment)}
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
            </StyledCol>
        </>
    );
};
