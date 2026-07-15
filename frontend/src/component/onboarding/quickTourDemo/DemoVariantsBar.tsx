import { useRef, useState } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import type { DemoVariant } from './demoModel.js';

const StyledBar = styled(Box)(({ theme }) => ({
    position: 'relative',
    height: theme.spacing(4.5),
    userSelect: 'none',
    touchAction: 'none',
}));

const StyledSegments = styled(Box)(({ theme }) => ({
    display: 'flex',
    height: '100%',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
}));

const StyledSegment = styled(Box, {
    shouldForwardProp: (prop) =>
        !['color', 'selected'].includes(prop as string),
})<{ color: string; selected: boolean }>(({ theme, color, selected }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    background: color,
    color: theme.palette.getContrastText(color),
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
    boxShadow: selected
        ? `inset 0 0 0 2px ${theme.palette.background.paper}`
        : 'none',
}));

const StyledHandle = styled('div')(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(-0.75),
    bottom: theme.spacing(-0.75),
    width: theme.spacing(3),
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'ew-resize',
    zIndex: 1,
    color: theme.palette.text.primary,
    '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: -2,
    },
    '& .handle-grip': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        height: '100%',
        width: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        background: theme.palette.background.paper,
        boxShadow: theme.boxShadows.elevated,
        border: `1px solid ${theme.palette.divider}`,
        transition: theme.transitions.create(
            ['transform', 'box-shadow', 'background'],
            { duration: theme.transitions.duration.shortest },
        ),
        transformOrigin: 'center',
    },
    '& .handle-dot': {
        width: 3,
        height: 3,
        borderRadius: '50%',
        background: theme.palette.text.secondary,
    },
    '& .handle-dots': {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    },
    '&:hover .handle-grip, &.is-dragging .handle-grip': {
        transform: 'scaleY(1.2) scaleX(1.15)',
        background: theme.palette.text.primary,
        borderColor: theme.palette.text.primary,
    },
    '&:hover .handle-dot, &.is-dragging .handle-dot': {
        background: theme.palette.background.paper,
    },
    '&.is-dragging': {
        cursor: 'grabbing',
    },
}));

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

interface IDemoVariantsBarProps {
    /** Variants with integer weights summing to 100. */
    variants: DemoVariant[];
    selected?: string;
    onWeightsChange: (weights: number[]) => void;
}

/**
 * The variant split as a directly manipulable bar: drag the edge between two
 * segments to trade weight between them (down to 0), like resizing columns.
 * Only adjacent weights change, so a 50/50/0 split is reachable.
 */
export const DemoVariantsBar = ({
    variants,
    selected,
    onWeightsChange,
}: IDemoVariantsBarProps) => {
    const theme = useTheme();
    const barRef = useRef<HTMLDivElement>(null);
    const [dragIndex, setDragIndex] = useState<number | null>(null);

    const weights = variants.map((variant) => Math.round(variant.weight));
    // cumulative[i] = right edge of segment i, in percent.
    const cumulative = weights.map((_, i) =>
        weights.slice(0, i + 1).reduce((a, b) => a + b, 0),
    );

    // Move boundary `b` (between segments b and b+1) to `pct`, trading weight
    // between the two adjacent segments only.
    const moveBoundary = (b: number, pct: number) => {
        const min = cumulative[b] - weights[b];
        const max = cumulative[b] + weights[b + 1];
        const position = clamp(Math.round(pct), min, max);
        const next = [...weights];
        next[b] = position - min;
        next[b + 1] = max - position;
        onWeightsChange(next);
    };

    const boundaryFromPointer = (b: number, clientX: number) => {
        const rect = barRef.current?.getBoundingClientRect();
        if (!rect || rect.width === 0) return;
        moveBoundary(b, ((clientX - rect.left) / rect.width) * 100);
    };

    return (
        <StyledBar ref={barRef}>
            <StyledSegments>
                {variants.map((variant, i) => {
                    const color =
                        variant.color ??
                        theme.palette.variants[
                            i % theme.palette.variants.length
                        ];
                    const weight = weights[i];
                    const label =
                        weight >= 14
                            ? `${variant.name} · ${weight}%`
                            : weight >= 7
                              ? variant.name
                              : '';
                    return (
                        <StyledSegment
                            key={variant.name}
                            color={color}
                            selected={selected === variant.name}
                            sx={{ width: `${weight}%` }}
                            title={`${variant.name} · ${weight}%`}
                        >
                            {label}
                        </StyledSegment>
                    );
                })}
            </StyledSegments>
            {variants.slice(0, -1).map((variant, b) => (
                <StyledHandle
                    key={`handle-${variant.name}`}
                    role='separator'
                    tabIndex={0}
                    aria-orientation='vertical'
                    aria-label={`Split between ${variants[b].name} and ${variants[b + 1].name}`}
                    aria-valuenow={cumulative[b]}
                    aria-valuemin={cumulative[b] - weights[b]}
                    aria-valuemax={cumulative[b] + weights[b + 1]}
                    className={dragIndex === b ? 'is-dragging' : undefined}
                    title='Drag to adjust split'
                    style={{ left: `${cumulative[b]}%` }}
                    onPointerDown={(event) => {
                        event.preventDefault();
                        event.currentTarget.setPointerCapture(event.pointerId);
                        setDragIndex(b);
                    }}
                    onPointerMove={(event) => {
                        if (dragIndex === b) {
                            boundaryFromPointer(b, event.clientX);
                        }
                    }}
                    onPointerUp={() => setDragIndex(null)}
                    onPointerCancel={() => setDragIndex(null)}
                    onKeyDown={(event) => {
                        if (event.key === 'ArrowLeft') {
                            event.preventDefault();
                            moveBoundary(b, cumulative[b] - 1);
                        } else if (event.key === 'ArrowRight') {
                            event.preventDefault();
                            moveBoundary(b, cumulative[b] + 1);
                        }
                    }}
                >
                    <div className='handle-grip'>
                        <div className='handle-dots'>
                            <span className='handle-dot' />
                            <span className='handle-dot' />
                            <span className='handle-dot' />
                        </div>
                        <div className='handle-dots'>
                            <span className='handle-dot' />
                            <span className='handle-dot' />
                            <span className='handle-dot' />
                        </div>
                    </div>
                </StyledHandle>
            ))}
        </StyledBar>
    );
};
