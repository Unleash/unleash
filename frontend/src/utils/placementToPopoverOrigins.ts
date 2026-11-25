import type { PopoverOrigin, PopperPlacementType } from '@mui/material';

export type Placement = Exclude<
    PopperPlacementType,
    'auto' | 'auto-start' | 'auto-end'
>;

type Side = 'top' | 'right' | 'bottom' | 'left';
type Alignment = 'start' | 'end' | 'center';

type VerticalSide = Extract<Side, 'top' | 'bottom'>;
type HorizontalSide = Extract<Side, 'left' | 'right'>;

const OPPOSITE_VERTICAL: Record<VerticalSide, VerticalSide> = {
    top: 'bottom',
    bottom: 'top',
};

const OPPOSITE_HORIZONTAL: Record<HorizontalSide, HorizontalSide> = {
    left: 'right',
    right: 'left',
};

const VERTICAL_ALIGNMENT: Record<Alignment, PopoverOrigin['vertical']> = {
    start: 'top',
    end: 'bottom',
    center: 'center',
};

const HORIZONTAL_ALIGNMENT: Record<Alignment, PopoverOrigin['horizontal']> = {
    start: 'left',
    end: 'right',
    center: 'center',
};

/**
 * Lets Popover-based components (Menu, Popover) take the same placement values
 * as Popper-based ones (Tooltip, Popper).
 */
export const placementToPopoverOrigins = (
    placement: Placement,
): { anchorOrigin: PopoverOrigin; transformOrigin: PopoverOrigin } => {
    const [side, alignment = 'center'] = placement.split('-') as [
        Side,
        Alignment?,
    ];

    if (side === 'top' || side === 'bottom') {
        const horizontal = HORIZONTAL_ALIGNMENT[alignment];
        return {
            anchorOrigin: { vertical: side, horizontal },
            transformOrigin: { vertical: OPPOSITE_VERTICAL[side], horizontal },
        };
    }

    const vertical = VERTICAL_ALIGNMENT[alignment];
    return {
        anchorOrigin: { vertical, horizontal: side },
        transformOrigin: { vertical, horizontal: OPPOSITE_HORIZONTAL[side] },
    };
};
