import type { FC, ReactNode } from 'react';
import { useMemo, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { styled } from '@mui/material';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const StyledGridContainer = styled('div')(({ theme }) => ({
    '& .react-grid-layout': {
        position: 'relative',
        minHeight: '200px',
    },
    '& .react-grid-item': {
        transition: 'all 200ms ease',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.paper,
        overflow: 'hidden',
        '&.react-grid-item--placeholder': {
            backgroundColor: theme.palette.action.hover,
            opacity: 0.6,
            borderStyle: 'dashed',
            borderWidth: '2px',
            borderColor: theme.palette.primary.main,
        },
        '&:hover:not(.react-grid-item--dragging)': {
            boxShadow: theme.shadows[4],
            borderColor: theme.palette.primary.light,
        },
        '&.react-grid-item--dragging': {
            opacity: 0.8,
            zIndex: 1000,
            transform: 'rotate(2deg)',
            boxShadow: theme.shadows[8],
            borderColor: theme.palette.primary.main,
        },
        '&.react-grid-item--resizing': {
            opacity: 0.9,
            zIndex: 999,
            boxShadow: theme.shadows[6],
        },
    },
    '& .react-resizable-handle': {
        position: 'absolute',
        width: '20px',
        height: '20px',
        bottom: '0px',
        right: '0px',
        cursor: 'se-resize',
        backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgMTdMMTcgM00zIDEzTDEzIDNNNyAxN0wxNyA3IiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=')`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        '&:hover': {
            backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgMTdMMTcgM00zIDEzTDEzIDNNNyAxN0wxNyA3IiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=')`,
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
    // Memoize layouts to prevent unnecessary re-renders
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

    // Memoize children to improve performance
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
