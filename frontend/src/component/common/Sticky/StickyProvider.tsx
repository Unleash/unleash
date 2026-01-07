import {
    useState,
    useCallback,
    type ReactNode,
    type RefObject,
    useEffect,
} from 'react';
import { StickyContext } from './StickyContext.tsx';

interface IStickyProviderProps {
    children: ReactNode;
}

export const StickyProvider = ({ children }: IStickyProviderProps) => {
    const [stickyItems, setStickyItems] = useState<RefObject<HTMLDivElement>[]>(
        [],
    );
    const [resizeListeners, setResizeListeners] = useState(
        new Set<RefObject<HTMLDivElement>>(),
    );

    const registerStickyItem = useCallback(
        (item: RefObject<HTMLDivElement>) => {
            setStickyItems((prevItems) => {
                // We should only register a new item if it is not already registered
                if (!prevItems.includes(item)) {
                    // Register resize listener for the item
                    registerResizeListener(item);

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
            unregisterResizeListener(ref);
            setStickyItems((prev) => prev.filter((item) => item !== ref));
        },
        [],
    );

    const registerResizeListener = useCallback(
        (ref: RefObject<HTMLDivElement>) => {
            setResizeListeners((prev) => new Set(prev).add(ref));
        },
        [],
    );

    const unregisterResizeListener = useCallback(
        (ref: RefObject<HTMLDivElement>) => {
            setResizeListeners((prev) => {
                const newListeners = new Set(prev);
                newListeners.delete(ref);
                return newListeners;
            });
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
                stickyItems.indexOf(ref),
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

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            // We should recalculate top offsets whenever there's a resize
            // This will trigger the dependency in `getTopOffset` and recalculate the top offsets in the Sticky components
            setStickyItems((prev) => [...prev]);
        });

        resizeListeners.forEach((item) => {
            if (item.current) {
                resizeObserver.observe(item.current);
            }
        });

        return () => {
            if (resizeListeners.size > 0) {
                resizeListeners.forEach((item) => {
                    if (item.current) {
                        resizeObserver.unobserve(item.current);
                    }
                });
            }
        };
    }, [resizeListeners]);

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
