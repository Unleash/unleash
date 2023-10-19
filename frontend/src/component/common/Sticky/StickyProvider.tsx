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
                // We should only register a new item if it is not already registered
                if (!prevItems.includes(item)) {
                    const newItems = [...prevItems, item];
                    // We should try to sort the items by their top on the viewport, so that their order in the DOM is the same as their order in the array
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
            if (!stickyItems.some((item) => item === ref)) {
                // Return 0 in case the item is not registered yet
                return 0;
            }
            const stickyItemsUpToOurItem = stickyItems.slice(
                0,
                stickyItems.findIndex((item) => item === ref),
            );
            return stickyItemsUpToOurItem.reduce((acc, item) => {
                if (item === ref) {
                    // We should not include the current item in the calculation
                    return acc;
                }

                // Accumulate the height of all sticky items above our item
                const itemHeight =
                    item.current?.getBoundingClientRect().height || 0;

                return acc + itemHeight;
            }, 0);
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
