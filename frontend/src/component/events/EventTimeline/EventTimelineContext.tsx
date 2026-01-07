import { createContext, useContext } from 'react';
import type { IEventTimelineContext } from './EventTimelineProvider.tsx';

export const EventTimelineContext = createContext<
    IEventTimelineContext | undefined
>(undefined);

export const useEventTimelineContext = (): IEventTimelineContext => {
    const context = useContext(EventTimelineContext);

    if (!context) {
        throw new Error(
            'useEventTimelineContext must be used within a EventTimelineProvider',
        );
    }

    return context;
};
