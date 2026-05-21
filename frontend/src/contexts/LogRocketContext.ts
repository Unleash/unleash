import { createContext } from 'react';

export type LogRocketTracker = {
    track: (
        event: string,
        props?: Record<string, string | number | boolean>,
    ) => void;
};

export const LogRocketContext = createContext<LogRocketTracker | null>(null);
