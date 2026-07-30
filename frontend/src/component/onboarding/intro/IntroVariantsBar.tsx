import { useRef, useState } from 'react';
import { Box, Fade, styled, Typography, useTheme } from '@mui/material';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import type { IntroVariant } from './introModel.js';
import { getVariantSolidFill } from './introVariantColor.js';

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
    background: getVariantSolidFill(color),
    color: theme.palette.common.white,
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
    boxShadow: selected
        ? `inset 0 0 0 2px ${theme.palette.background.paper}`
        : 'none',
    transition: theme.transitions.create(
        ['background-color', 'color', 'box-shadow'],
        {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeOut,
        },
    ),
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
    '&:hover, &:focus-visible, &.is-dragging': {
        zIndex: 2,
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

const StyledPayloadTooltip = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.75),
    minWidth: theme.spacing(30),
}));

const StyledPayloadHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    color: theme.palette.text.primary,
}));

const StyledVariantSwatch = styled('span')<{ color: string }>(
    ({ theme, color }) => ({
        display: 'block',
        alignSelf: 'center',
        width: 10,
        height: 10,
        flexShrink: 0,
        borderRadius: '50%',
        background: color,
        border: `1px solid ${theme.palette.divider}`,
    }),
);

const StyledPayloadJson = styled('pre')(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(0.75, 1),
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.background.elevation1,
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
    lineHeight: 1.45,
    whiteSpace: 'pre-wrap',
    '& .json-key': {
        color: theme.palette.primary.main,
    },
    '& .json-string': {
        color: theme.palette.success.main,
    },
    '& .json-punctuation': {
        color: theme.palette.text.secondary,
    },
}));

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

interface IIntroVariantsBarProps {
    /** Variants with integer weights summing to 100. */
    variants: IntroVariant[];
    selected?: string;
    onWeightsChange: (weights: number[]) => void;
}

/**
 * The variant split as a directly manipulable bar: drag the edge between two
 * segments to trade weight between them (down to 0), like resizing columns.
 * Only adjacent weights change, so a 50/50/0 split is reachable.
 */
export const IntroVariantsBar = ({
    variants,
    selected,
    onWeightsChange,
}: IIntroVariantsBarProps) => {
    const theme = useTheme();
    const barRef = useRef<HTMLDivElement>(null);
    const [dragIndex, setDragIndex] = useState<number | null>(null);

    const weights = variants.map((variant) => Math.round(variant.weight));
    // cumulative[i] = right edge of segment i, in percent.
    const cumulative = weights.map((_, i) =>
        weights.slice(0, i + 1).reduce((a, b) => a + b, 0),
    );

    const boundaryRange = (b: number) => ({
        min: cumulative[b] - weights[b],
        max: cumulative[b] + weights[b + 1],
    });

    // Move boundary `b` (between segments b and b+1) to `pct`, trading weight
    // between the two adjacent segments only.
    const moveBoundary = (b: number, pct: number) => {
        const { min, max } = boundaryRange(b);
        const position = clamp(Math.round(pct), min, max);
        const next = [...weights];
        next[b] = position - min;
        next[b + 1] = max - position;
        onWeightsChange(next);
    };

    /**
     * Zero-width variants stack multiple handles at the same position. The
     * visible handle may have no weight on either side, so delegate the motion
     * to the overlapping boundary that can move in the requested direction.
     */
    const moveOverlappingBoundary = (b: number, pct: number) => {
        const position = cumulative[b];
        const overlapping = cumulative
            .slice(0, -1)
            .map((value, index) => ({ value, index }))
            .filter(({ value }) => value === position)
            .map(({ index }) => index);
        const resolved =
            pct < position
                ? overlapping.find(
                      (index) => boundaryRange(index).min < position,
                  )
                : pct > position
                  ? overlapping
                        .toReversed()
                        .find((index) => boundaryRange(index).max > position)
                  : b;
        moveBoundary(resolved ?? b, pct);
    };

    const boundaryFromPointer = (b: number, clientX: number) => {
        const rect = barRef.current?.getBoundingClientRect();
        if (!rect || rect.width === 0) return;
        moveOverlappingBoundary(b, ((clientX - rect.left) / rect.width) * 100);
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
                        <TooltipResolver
                            key={variant.name}
                            variant='custom'
                            arrow
                            placement='top'
                            slots={{ transition: Fade }}
                            titleComponent={
                                <StyledPayloadTooltip>
                                    <StyledPayloadHeader>
                                        <StyledVariantSwatch color={color} />
                                        <Typography
                                            variant='caption'
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            Variant {variant.name} · {weight}%
                                            allocation
                                        </Typography>
                                    </StyledPayloadHeader>
                                    <StyledPayloadJson data-testid='QUICK_TOUR_INTRO_VARIANT_PAYLOAD'>
                                        <span className='json-punctuation'>
                                            {'{\n'}
                                        </span>
                                        {'  '}
                                        <span className='json-key'>
                                            "placeholder"
                                        </span>
                                        <span className='json-punctuation'>
                                            {': '}
                                        </span>
                                        <span className='json-string'>
                                            {`"${variant.placeholder}"`}
                                        </span>
                                        <span className='json-punctuation'>
                                            {',\n'}
                                        </span>
                                        {'  '}
                                        <span className='json-key'>
                                            "accent"
                                        </span>
                                        <span className='json-punctuation'>
                                            {': '}
                                        </span>
                                        <span className='json-string'>
                                            {`"${color}"`}
                                        </span>
                                        <span className='json-punctuation'>
                                            {'\n}'}
                                        </span>
                                    </StyledPayloadJson>
                                </StyledPayloadTooltip>
                            }
                        >
                            <StyledSegment
                                color={color}
                                selected={selected === variant.name}
                                sx={{ width: `${weight}%` }}
                                tabIndex={0}
                                aria-label={`Variant ${variant.name}, ${weight}% allocation`}
                                data-testid={`QUICK_TOUR_INTRO_VARIANT_SEGMENT_${variant.name}`}
                            >
                                {label}
                            </StyledSegment>
                        </TooltipResolver>
                    );
                })}
            </StyledSegments>
            {variants.slice(0, -1).map((variant, b) => {
                const overlapping = cumulative
                    .slice(0, -1)
                    .map((value, index) => ({ value, index }))
                    .filter(({ value }) => value === cumulative[b])
                    .map(({ index }) => boundaryRange(index));
                const ariaMin = Math.min(...overlapping.map(({ min }) => min));
                const ariaMax = Math.max(...overlapping.map(({ max }) => max));

                return (
                    <StyledHandle
                        key={`handle-${variant.name}`}
                        role='separator'
                        tabIndex={0}
                        aria-orientation='vertical'
                        aria-label={`Split between ${variants[b].name} and ${variants[b + 1].name}`}
                        aria-valuenow={cumulative[b]}
                        aria-valuemin={ariaMin}
                        aria-valuemax={ariaMax}
                        className={dragIndex === b ? 'is-dragging' : undefined}
                        title='Drag to adjust split'
                        style={{ left: `${cumulative[b]}%` }}
                        onPointerDown={(event) => {
                            event.preventDefault();
                            event.currentTarget.setPointerCapture(
                                event.pointerId,
                            );
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
                                moveOverlappingBoundary(b, cumulative[b] - 1);
                            } else if (event.key === 'ArrowRight') {
                                event.preventDefault();
                                moveOverlappingBoundary(b, cumulative[b] + 1);
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
                );
            })}
        </StyledBar>
    );
};
