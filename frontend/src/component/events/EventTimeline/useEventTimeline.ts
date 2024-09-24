import { useLocalStorageState } from 'hooks/useLocalStorageState';
import type { IEnvironment } from 'interfaces/environments';

export type TimeSpanOption = {
    key: string;
    label: string;
    value: Duration;
    markers: string[];
};

export const timeSpanOptions: TimeSpanOption[] = [
    {
        key: '30m',
        label: 'last 30 min',
        value: { minutes: 30 },
        markers: ['30 min ago'],
    },
    {
        key: '1h',
        label: 'last hour',
        value: { hours: 1 },
        markers: ['1 hour ago', '30 min ago'],
    },
    {
        key: '3h',
        label: 'last 3 hours',
        value: { hours: 3 },
        markers: ['3 hours ago', '2 hours ago', '1 hour ago'],
    },
    {
        key: '12h',
        label: 'last 12 hours',
        value: { hours: 12 },
        markers: ['12 hours ago', '9 hours ago', '6 hours ago', '3 hours ago'],
    },
    {
        key: '24h',
        label: 'last 24 hours',
        value: { hours: 24 },
        markers: [
            '24 hours ago',
            '18 hours ago',
            '12 hours ago',
            '6 hours ago',
        ],
    },
    {
        key: '48h',
        label: 'last 48 hours',
        value: { hours: 48 },
        markers: [
            '48 hours ago',
            '36 hours ago',
            '24 hours ago',
            '12 hours ago',
        ],
    },
];

type EventTimelineState = {
    open: boolean;
    timeSpan: TimeSpanOption;
    environment?: IEnvironment;
};

const defaultState: EventTimelineState = {
    open: true,
    timeSpan: timeSpanOptions[0],
};

export const useEventTimeline = () => {
    const [state, setState] = useLocalStorageState<EventTimelineState>(
        'event-timeline:v1',
        defaultState,
    );

    const setField = <K extends keyof EventTimelineState>(
        key: K,
        value: EventTimelineState[K],
    ) => {
        setState((prevState) => ({ ...prevState, [key]: value }));
    };

    return {
        ...state,
        setOpen: (open: boolean) => setField('open', open),
        setTimeSpan: (timeSpan: TimeSpanOption) =>
            setField('timeSpan', timeSpan),
        setEnvironment: (environment: IEnvironment) =>
            setField('environment', environment),
    };
};
