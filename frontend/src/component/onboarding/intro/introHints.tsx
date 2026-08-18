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

// The dot stays mounted (just hidden) while inactive so the popper positions
// correctly the instant `active` flips true.
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
