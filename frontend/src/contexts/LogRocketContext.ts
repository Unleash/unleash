import { createContext } from 'react';
import type { ScalarProps } from './EventTrackerContext';

/**
 * The post-init LogRocket API surface available to consumers.
 * Intentionally narrow: init and identify are handled by LogRocketProvider.
 * Expose additional LogRocket methods here as we need them.
 */
export type LogRocketInstance = {
    track: (event: string, props?: ScalarProps) => void;
};

export const LogRocketContext = createContext<LogRocketInstance | null>(null);
