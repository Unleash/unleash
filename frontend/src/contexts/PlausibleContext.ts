import { createContext } from 'react';
import Plausible from 'plausible-tracker';

export const PlausibleContext = createContext<ReturnType<
    typeof Plausible
> | null>(null);
