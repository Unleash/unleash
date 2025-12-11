import {
    type HTMLAttributes,
    type ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { StickyContext } from './StickyContext.tsx';
import { styled } from '@mui/material';

const StyledSticky = styled('div', {
    shouldForwardProp: (prop) => prop !== 'top',
})<{ top?: number }>(({ theme, top }) => ({
    position: 'sticky',
    zIndex: theme.zIndex.sticky - 100,
    ...(top !== undefined
        ? {
              '&': {
                  top,
              },
          }
        : {}),
}));

interface IStickyProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export const Sticky = ({ children, ...props }: IStickyProps) => {
    const context = useContext(StickyContext);
    const ref = useRef<HTMLDivElement>(null);
    const [initialTopOffset, setInitialTopOffset] = useState<number | null>(
        null,
    );
    const [top, setTop] = useState<number>();

    if (!context) {
        throw new Error(
            'Sticky component must be used within a StickyProvider',
        );
    }

    const { registerStickyItem, unregisterStickyItem, getTopOffset } = context;

    useEffect(() => {
        // We should only set the initial top offset once - when the component is mounted
        // This value will be set based on the initial top that was set for this component
        // After that, the top will be calculated based on the height of the previous sticky items + this initial top offset
        if (ref.current && initialTopOffset === null) {
            setInitialTopOffset(
                Number.parseInt(
                    getComputedStyle(ref.current).getPropertyValue('top'),
                    10,
                ),
            );
        }
    }, []);

    useEffect(() => {
        // (Re)calculate the top offset based on the sticky items
        setTop(getTopOffset(ref) + (initialTopOffset || 0));
    }, [getTopOffset, initialTopOffset]);

    useEffect(() => {
        // We should register the sticky item when it is mounted and unregister it when it is unmounted
        if (!ref.current) {
            return;
        }

        registerStickyItem(ref);

        return () => {
            unregisterStickyItem(ref);
        };
    }, [ref, registerStickyItem, unregisterStickyItem]);

    return (
        <StyledSticky ref={ref} top={top} {...props}>
            {children}
        </StyledSticky>
    );
};
