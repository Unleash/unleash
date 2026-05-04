import { type RefObject, createContext } from 'react';

export interface IStickyContext {
    stickyItems: RefObject<HTMLDivElement | null>[];
    registerStickyItem: (ref: RefObject<HTMLDivElement | null>) => void;
    unregisterStickyItem: (ref: RefObject<HTMLDivElement | null>) => void;
    getTopOffset: (ref: RefObject<HTMLDivElement | null>) => number;
}

export const StickyContext = createContext<IStickyContext | undefined>(
    undefined,
);
