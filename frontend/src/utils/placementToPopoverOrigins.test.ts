import { expect, test } from 'vitest';
import { placementToPopoverOrigins } from './placementToPopoverOrigins.ts';

test.each([
    [
        'bottom-end',
        { vertical: 'bottom', horizontal: 'right' },
        { vertical: 'top', horizontal: 'right' },
    ],
    [
        'top-start',
        { vertical: 'top', horizontal: 'left' },
        { vertical: 'bottom', horizontal: 'left' },
    ],
    [
        'top',
        { vertical: 'top', horizontal: 'center' },
        { vertical: 'bottom', horizontal: 'center' },
    ],
    [
        'right-start',
        { vertical: 'top', horizontal: 'right' },
        { vertical: 'top', horizontal: 'left' },
    ],
    [
        'right-end',
        { vertical: 'bottom', horizontal: 'right' },
        { vertical: 'bottom', horizontal: 'left' },
    ],
    [
        'left',
        { vertical: 'center', horizontal: 'left' },
        { vertical: 'center', horizontal: 'right' },
    ],
] as const)('opens the popover %s of its anchor', (placement, anchorOrigin, transformOrigin) => {
    expect(placementToPopoverOrigins(placement)).toEqual({
        anchorOrigin,
        transformOrigin,
    });
});
