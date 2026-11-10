import { createContext } from 'react';

/**
 * The post-init LogRocket API surface available to consumers.
 * Intentionally narrow: init and identify are handled by LogRocketProvider.
 * Expose additional LogRocket methods here as we need them.
 */
export type LogRocketInstance = {
    track: (
        event: string,
        props?: Record<string, string | number | boolean>,
    ) => void;
};

export const LogRocketContext = createContext<LogRocketInstance | null>(null);
