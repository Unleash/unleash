import { createContext, useContext } from 'react';
import type { IHighlightContext } from './HighlightProvider.tsx';

export const HighlightContext = createContext<IHighlightContext | undefined>(
    undefined,
);

export const useHighlightContext = (): IHighlightContext => {
    const context = useContext(HighlightContext);

    if (!context) {
        throw new Error(
            'useHighlightContext must be used within a HighlightProvider',
        );
    }

    return context;
};
