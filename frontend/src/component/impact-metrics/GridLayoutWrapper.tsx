import type { FC, ReactNode } from 'react';
import { useMemo, useCallback } from 'react';
import GridLayout, { WidthProvider } from 'react-grid-layout';
import { styled, useTheme, useMediaQuery } from '@mui/material';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(GridLayout);

const StyledGridContainer = styled('div')(({ theme }) => ({
    '& .react-grid-item': {
        borderRadius: `${theme.shape.borderRadiusMedium}px`,
    },
    '& .grid-item-drag-handle': {
        [theme.breakpoints.down('md')]: {
            display: 'none',
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

type LayoutItem = {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    static?: boolean;
};

type GridLayoutWrapperProps = {
    items: GridItem[];
    onLayoutChange?: (layout: LayoutItem[]) => void;
    cols?: { lg: number; md: number; sm: number; xs: number; xxs: number };
    rowHeight?: number;
};

const ItemContainer = styled('div')(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
}));

export const GridLayoutWrapper: FC<GridLayoutWrapperProps> = ({
    items,
    onLayoutChange,
    cols = { lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 },
    rowHeight = 180,
}) => {
    const theme = useTheme();
    const isMobileBreakpoint = useMediaQuery(theme.breakpoints.down('md'));

    const layout = useMemo(() => {
        if (isMobileBreakpoint) {
            let currentY = 0;
            return items.map((item) => {
                const layoutItem = {
                    i: item.id,
                    x: 0,
                    y: currentY,
                    w: cols.xs,
                    h: item.h ?? 4,
                    minW: cols.xs,
                    minH: item.minH ?? 3,
                    maxW: cols.xs,
                    maxH: item.maxH ?? 8,
                    static: false,
                };
                currentY += layoutItem.h;
                return layoutItem;
            });
        }

        return items.map((item, index) => ({
            i: item.id,
            x:
                item.x ??
                (index % Math.floor(cols.lg / (item.w ?? 4))) * (item.w ?? 4),
            y:
                item.y ??
                Math.floor(index / Math.floor(cols.lg / (item.w ?? 4))) *
                    (item.h ?? 4),
            w: item.w ?? 4,
            h: item.h ?? 4,
            minW: item.minW ?? 4,
            minH: item.minH ?? 3,
            maxW: item.maxW ?? 12,
            maxH: item.maxH ?? 8,
            static: item.static ?? false,
        }));
    }, [items, cols, isMobileBreakpoint]);

    const children = useMemo(
        () =>
            items.map((item) => (
                <ItemContainer key={item.id}>{item.component}</ItemContainer>
            )),
        [items],
    );

    const handleLayoutChange = useCallback(
        (layout: LayoutItem[]) => {
            if (!isMobileBreakpoint) {
                onLayoutChange?.(layout);
            }
        },
        [onLayoutChange, isMobileBreakpoint],
    );

    return (
        <StyledGridContainer>
            <ResponsiveGridLayout
                className='impact-metrics-grid'
                layout={layout}
                cols={isMobileBreakpoint ? cols.xs : cols.lg}
                rowHeight={rowHeight}
                margin={[
                    Number.parseInt(theme.spacing(2), 10),
                    Number.parseInt(theme.spacing(2), 10),
                ]}
                containerPadding={[0, 0]}
                isDraggable={false}
                isResizable={false}
                onLayoutChange={handleLayoutChange}
                resizeHandles={['se']}
                draggableHandle='.grid-item-drag-handle'
                compactType={isMobileBreakpoint ? null : 'vertical'}
                preventCollision={false}
                useCSSTransforms={true}
                autoSize={true}
                allowOverlap={false}
            >
                {children}
            </ResponsiveGridLayout>
        </StyledGridContainer>
    );
};
