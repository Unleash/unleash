import { styled } from '@mui/material';
import type { FC, ReactNode } from 'react';

const Stack = styled('span')({
    display: 'inline-grid',
});

// Invisible bold copy that reserves the width. Always the heaviest weight the
// text can take, so the box never needs to grow when the visible text bolds.
const Ghost = styled('span')({
    gridArea: '1 / 1',
    visibility: 'hidden',
});

// The text that actually shows; inherits whatever weight the surrounding
// context applies (e.g. 500 normally, 700 when a tab is selected).
const Visible = styled('span')({
    gridArea: '1 / 1',
});

interface ISteadyWidthTextProps {
    children: ReactNode;
    /** Weight to reserve horizontal space for. Defaults to bold (700). */
    reserveWeight?: number;
}

/**
 * Renders text so its box is always sized for its bold width, regardless of the
 * weight actually applied by the surrounding context. Prevents the layout shift
 * that happens when font-weight toggles (active tabs, nav items, segmented
 * controls, …). The text stays content-width — it only reserves its own bold
 * width, nothing is hard-coded.
 */
export const SteadyWidthText: FC<ISteadyWidthTextProps> = ({
    children,
    reserveWeight = 700,
}) => (
    <Stack>
        <Ghost aria-hidden style={{ fontWeight: reserveWeight }}>
            {children}
        </Ghost>
        <Visible>{children}</Visible>
    </Stack>
);
