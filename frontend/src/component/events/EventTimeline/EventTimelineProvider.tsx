import type { ReactNode } from 'react';
import { EventTimelineContext } from './EventTimelineContext.tsx';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import type { IEnvironment } from 'interfaces/environments';

type TimeSpanOption = {
    key: string;
    label: string;
    value: Duration;
    markers: string[];
};

type EventTimelinePersistentState = {
    open: boolean;
    timeSpan: TimeSpanOption;
    environment?: IEnvironment;
    signalsSuggestionSeen?: boolean;
};

type EventTimelineStateSetters = {
    setOpen: (open: boolean) => void;
    setTimeSpan: (timeSpan: TimeSpanOption) => void;
    setEnvironment: (environment: IEnvironment) => void;
    setSignalsSuggestionSeen: (seen: boolean) => void;
};

export interface IEventTimelineContext
    extends EventTimelinePersistentState,
        EventTimelineStateSetters {}

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

const defaultState: EventTimelinePersistentState = {
    open: false,
    timeSpan: timeSpanOptions[0],
};

interface IEventTimelineProviderProps {
    children: ReactNode;
}

export const EventTimelineProvider = ({
    children,
}: IEventTimelineProviderProps) => {
    const [state, setState] =
        useLocalStorageState<EventTimelinePersistentState>(
            'event-timeline:v1',
            defaultState,
        );

    const setField = <K extends keyof EventTimelinePersistentState>(
        key: K,
        value: EventTimelinePersistentState[K],
    ) => {
        setState((prevState) => ({ ...prevState, [key]: value }));
    };

    const contextValue: IEventTimelineContext = {
        ...state,
        setOpen: (open: boolean) => setField('open', open),
        setTimeSpan: (timeSpan: TimeSpanOption) =>
            setField('timeSpan', timeSpan),
        setEnvironment: (environment: IEnvironment) =>
            setField('environment', environment),
        setSignalsSuggestionSeen: (seen: boolean) =>
            setField('signalsSuggestionSeen', seen),
    };

    return (
        <EventTimelineContext.Provider value={contextValue}>
            {children}
        </EventTimelineContext.Provider>
    );
};
