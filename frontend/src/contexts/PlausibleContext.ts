import { createContext } from 'react';
import type Plausible from 'plausible-tracker';

export const PlausibleContext = createContext<ReturnType<
    typeof Plausible
> | null>(null);
