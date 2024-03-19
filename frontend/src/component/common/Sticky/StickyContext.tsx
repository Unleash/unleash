import { type RefObject, createContext } from 'react';

export interface IStickyContext {
    stickyItems: RefObject<HTMLDivElement>[];
    registerStickyItem: (ref: RefObject<HTMLDivElement>) => void;
    unregisterStickyItem: (ref: RefObject<HTMLDivElement>) => void;
    getTopOffset: (ref: RefObject<HTMLDivElement>) => number;
}

export const StickyContext = createContext<IStickyContext | undefined>(
    undefined,
);
