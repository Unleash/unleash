import { useState, type ReactNode } from 'react';
import { HighlightContext } from './HighlightContext.tsx';

const defaultState = {
    eventTimeline: false,
};

export type HighlightKey = keyof typeof defaultState;
type HighlightState = typeof defaultState;

export interface IHighlightContext {
    isHighlighted: (key: HighlightKey) => boolean;
    highlight: (key: HighlightKey, timeout?: number) => void;
}

interface IHighlightProviderProps {
    children: ReactNode;
}

export const HighlightProvider = ({ children }: IHighlightProviderProps) => {
    const [state, setState] = useState<HighlightState>(defaultState);

    const isHighlighted = (key: HighlightKey) => state[key];

    const setHighlight = (key: HighlightKey, value: boolean) => {
        setState((prevState) => ({ ...prevState, [key]: value }));
    };

    const highlight = (key: HighlightKey, timeout = 3000) => {
        setHighlight(key, true);
        setTimeout(() => setHighlight(key, false), timeout);
    };

    const contextValue: IHighlightContext = {
        isHighlighted,
        highlight,
    };

    return (
        <HighlightContext.Provider value={contextValue}>
            {children}
        </HighlightContext.Provider>
    );
};
