import { useCallback, useEffect, useState } from 'react';
import {
    keyframes,
    styled,
    Tooltip,
    type SxProps,
    type Theme,
    type TooltipProps,
} from '@mui/material';

const HINT_DELAY_MS = 3000;

/**
 * Show a subtle nudge once the user has sat idle on a step's control for a few
 * seconds. `active` gates whether the hint is eligible at all (typically: only
 * on a given step, and only until the user engages with the right control). The
 * timer restarts whenever `active` flips true or `bump()` is called, so
 * interacting with the intended control defers the nudge - and once `active`
 * goes false, the nudge never appears (or immediately hides). This is what keeps
 * the hint from showing for users who start clicking straight away.
 */
export const useIdleHint = (active: boolean, delayMs = HINT_DELAY_MS) => {
    const [show, setShow] = useState(false);
    const [nonce, setNonce] = useState(0);
    // biome-ignore lint/correctness/useExhaustiveDependencies: nonce is intentionally a restart trigger
    useEffect(() => {
        if (!active) {
            setShow(false);
            return;
        }
        setShow(false);
        const id = setTimeout(() => setShow(true), delayMs);
        return () => clearTimeout(id);
    }, [active, delayMs, nonce]);
    const bump = useCallback(() => setNonce((value) => value + 1), []);
    return [show, bump] as const;
};

const ping = keyframes`
  0% { transform: scale(1); opacity: 0.45; }
  70% { transform: scale(2.4); opacity: 0; }
  100% { transform: scale(2.4); opacity: 0; }
`;

/**
 * A pulsing dot that draws attention to a control the user hasn't touched yet.
 * Render it inside a relatively-positioned parent and place it with `sx`; it
 * never intercepts pointer events.
 */
const HintDot = styled('span')(({ theme }) => ({
    position: 'absolute',
    width: theme.spacing(2),
    height: theme.spacing(2),
    borderRadius: '50%',
    background: theme.palette.primary.main,
    pointerEvents: 'none',
    zIndex: 2,
    '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: theme.palette.primary.main,
        animation: `${ping} 1.8s ease-out infinite`,
    },
    '@media (prefers-reduced-motion: reduce)': {
        '&::before': { animation: 'none' },
    },
}));

/**
 * A guidance nudge: a pulsing dot with a tooltip emanating from it, explaining
 * which control to use. Render it unconditionally inside a relatively-positioned
 * parent and toggle it with `active`; the dot stays mounted (just hidden) while
 * inactive so the tooltip's anchor is ready and the popper positions correctly
 * the instant it opens. Place the dot with `sx`.
 */
export const HintBadge = ({
    active,
    title,
    placement = 'top',
    sx,
}: {
    active: boolean;
    title: string;
    placement?: TooltipProps['placement'];
    sx?: SxProps<Theme>;
}) => (
    <Tooltip open={active} arrow title={title} placement={placement}>
        <HintDot
            sx={[
                { visibility: active ? 'visible' : 'hidden' },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        />
    </Tooltip>
);
