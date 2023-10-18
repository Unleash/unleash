import { useState, useCallback, ReactNode, RefObject } from 'react';
import { StickyContext } from './StickyContext';

interface IStickyProviderProps {
    children: ReactNode;
}

export const StickyProvider = ({ children }: IStickyProviderProps) => {
    const [stickyItems, setStickyItems] = useState<RefObject<HTMLDivElement>[]>(
        [],
    );

    const registerStickyItem = useCallback(
        (item: RefObject<HTMLDivElement>) => {
            setStickyItems((prevItems) => {
                if (item && !prevItems.includes(item)) {
                    const newItems = [...prevItems, item];
                    return newItems.sort((a, b) => {
                        const elementA = a.current;
                        const elementB = b.current;
                        if (elementA && elementB) {
                            return (
                                elementA.getBoundingClientRect().top -
                                elementB.getBoundingClientRect().top
                            );
                        }
                        return 0;
                    });
                }

                return prevItems;
            });
        },
        [],
    );

    const unregisterStickyItem = useCallback(
        (ref: RefObject<HTMLDivElement>) => {
            setStickyItems((prev) => prev.filter((item) => item !== ref));
        },
        [],
    );

    const getTopOffset = useCallback(
        (ref: RefObject<HTMLDivElement>) => {
            return stickyItems.some((item) => item === ref)
                ? stickyItems
                      .slice(
                          0,
                          stickyItems.findIndex((item) => item === ref),
                      )
                      .reduce((acc, item) => {
                          return item === ref
                              ? acc
                              : acc +
                                      (item.current?.getBoundingClientRect()
                                          .height || 0);
                      }, 0)
                : 0;
        },
        [stickyItems],
    );

    return (
        <StickyContext.Provider
            value={{
                stickyItems,
                registerStickyItem,
                unregisterStickyItem,
                getTopOffset,
            }}
        >
            {children}
        </StickyContext.Provider>
    );
};
