import { useMemo, useState } from 'react';
import {
    ClickAwayListener,
    Grow,
    Paper,
    Popper,
    type PopperPlacementType,
    styled,
} from '@mui/material';
import { capitalize } from '@mui/material/utils';

const ARROW_SIZE = 7;
const ARROW_CORNER_CLEARANCE = 12;

type Side = 'top' | 'right' | 'bottom' | 'left';

const OPPOSITE: Record<Side, Side> = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
};

const toSide = (placement: PopperPlacementType) =>
    placement.split('-')[0] as Side;

const HintPopper = styled(Popper)(({ theme }) => ({
    zIndex: theme.zIndex.tooltip,
}));

const HintPaper = styled(Paper, {
    shouldForwardProp: (prop) => prop !== 'side',
})<{ side: Side }>(({ theme, side }) => ({
    position: 'relative',
    padding: theme.spacing(1.5, 2),
    [`margin${capitalize(OPPOSITE[side])}`]: theme.spacing(1.5),
    maxWidth: 280,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusMedium,
    boxShadow: theme.boxShadows.popup,
}));

// HintArrow only picks which edge the arrow sits on and which way it points.
// Where along that edge it sits is set by Popper's arrow modifier (see
// `modifiers` below), which aims it at the anchor's centre.
const HintArrow = styled('span', {
    shouldForwardProp: (prop) => prop !== 'side',
})<{ side: Side }>(({ theme, side }) => {
    const transparent = `${ARROW_SIZE}px solid transparent`;
    const pointsVertically = side === 'top' || side === 'bottom';
    return {
        position: 'absolute',
        width: 0,
        height: 0,
        [OPPOSITE[side]]: -ARROW_SIZE,
        [`border${capitalize(side)}`]: `${ARROW_SIZE}px solid ${theme.palette.background.paper}`,
        ...(pointsVertically
            ? { borderLeft: transparent, borderRight: transparent }
            : { borderTop: transparent, borderBottom: transparent }),
    };
});

interface HelpMenuHintProps {
    open: boolean;
    anchorEl: HTMLElement | null;
    placement: PopperPlacementType;
    onClose: () => void;
    children: React.ReactNode;
}

export const HelpMenuHint = ({
    open,
    anchorEl,
    placement,
    onClose,
    children,
}: HelpMenuHintProps) => {
    const [arrowEl, setArrowEl] = useState<HTMLSpanElement | null>(null);
    const modifiers = useMemo(
        () => [
            {
                name: 'arrow',
                enabled: Boolean(arrowEl),
                options: {
                    element: arrowEl,
                    padding: ARROW_CORNER_CLEARANCE,
                },
            },
        ],
        [arrowEl],
    );

    return (
        <HintPopper
            open={open}
            anchorEl={anchorEl}
            placement={placement}
            modifiers={modifiers}
            transition
        >
            {({ TransitionProps, placement: resolvedPlacement }) => {
                const side = toSide(resolvedPlacement);
                return (
                    <ClickAwayListener onClickAway={onClose}>
                        <Grow
                            {...TransitionProps}
                            style={{ transformOrigin: OPPOSITE[side] }}
                            timeout={200}
                        >
                            <HintPaper side={side}>
                                <HintArrow ref={setArrowEl} side={side} />
                                {children}
                            </HintPaper>
                        </Grow>
                    </ClickAwayListener>
                );
            }}
        </HintPopper>
    );
};
