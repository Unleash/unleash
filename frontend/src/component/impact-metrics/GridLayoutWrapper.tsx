import type { FC, ReactNode } from 'react';
import { useMemo, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { styled } from '@mui/material';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const StyledGridContainer = styled('div')(({ theme }) => ({
    '& .react-grid-item': {
        borderRadius: `${theme.shape.borderRadiusMedium}px`,
    },
    '& .react-resizable-handle': {
        '&::after': {
            opacity: 0.5,
        },
    },
}));

export type GridItem = {
    id: string;
    component: ReactNode;
    w?: number;
    h?: number;
    x?: number;
    y?: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    static?: boolean;
};

type GridLayoutWrapperProps = {
    items: GridItem[];
    onLayoutChange?: (layout: unknown[]) => void;
    cols?: { lg: number; md: number; sm: number; xs: number; xxs: number };
    rowHeight?: number;
    margin?: [number, number];
    isDraggable?: boolean;
    isResizable?: boolean;
    compactType?: 'vertical' | 'horizontal' | null;
};

export const GridLayoutWrapper: FC<GridLayoutWrapperProps> = ({
    items,
    onLayoutChange,
    cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
    rowHeight = 180,
    margin = [16, 16],
    isDraggable = true,
    isResizable = true,
    compactType = 'vertical',
}) => {
    const layouts = useMemo(() => {
        const baseLayout = items.map((item, index) => ({
            i: item.id,
            x: item.x ?? (index % cols.lg) * (item.w ?? 6),
            y: item.y ?? Math.floor(index / cols.lg) * (item.h ?? 4),
            w: item.w ?? 6,
            h: item.h ?? 4,
            minW: item.minW ?? 3,
            minH: item.minH ?? 3,
            maxW: item.maxW ?? 12,
            maxH: item.maxH ?? 8,
            static: item.static ?? false,
        }));

        return {
            lg: baseLayout,
            md: baseLayout.map((item) => ({
                ...item,
                w: Math.min(item.w, cols.md),
                x: Math.min(item.x, cols.md - item.w),
            })),
            sm: baseLayout.map((item) => ({
                ...item,
                w: Math.min(item.w, cols.sm),
                x: Math.min(item.x, cols.sm - item.w),
            })),
            xs: baseLayout.map((item) => ({
                ...item,
                w: Math.min(item.w, cols.xs),
                x: Math.min(item.x, cols.xs - item.w),
            })),
            xxs: baseLayout.map((item) => ({
                ...item,
                w: Math.min(item.w, cols.xxs),
                x: Math.min(item.x, cols.xxs - item.w),
            })),
        };
    }, [items, cols]);

    const children = useMemo(
        () => items.map((item) => <div key={item.id}>{item.component}</div>),
        [items],
    );

    const handleLayoutChange = useCallback(
        (layout: unknown[], layouts: unknown) => {
            onLayoutChange?.(layout);
        },
        [onLayoutChange],
    );

    return (
        <StyledGridContainer>
            <ResponsiveGridLayout
                className='impact-metrics-grid'
                layouts={layouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={cols}
                rowHeight={rowHeight}
                margin={margin}
                containerPadding={[0, 0]}
                isDraggable={isDraggable}
                isResizable={isResizable}
                onLayoutChange={handleLayoutChange}
                resizeHandles={['se']}
                draggableHandle='.grid-item-drag-handle'
                compactType={compactType}
                preventCollision={false}
                useCSSTransforms={true}
                autoSize={true}
            >
                {children}
            </ResponsiveGridLayout>
        </StyledGridContainer>
    );
};
