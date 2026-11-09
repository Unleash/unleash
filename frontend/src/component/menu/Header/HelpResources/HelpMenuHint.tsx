import { ClickAwayListener, Grow, Paper, Popper, styled } from '@mui/material';

const ARROW_SIZE = 7;

const HintPopper = styled(Popper)(({ theme }) => ({
    zIndex: theme.zIndex.tooltip,
}));

const HintPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    padding: theme.spacing(1.5, 2),
    marginTop: theme.spacing(1.5),
    maxWidth: 280,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusMedium,
    boxShadow: theme.boxShadows.popup,
    '&::before': {
        content: '""',
        position: 'absolute',
        top: -ARROW_SIZE,
        right: theme.spacing(1.5),
        width: 0,
        height: 0,
        borderLeft: `${ARROW_SIZE}px solid transparent`,
        borderRight: `${ARROW_SIZE}px solid transparent`,
        borderBottom: `${ARROW_SIZE}px solid ${theme.palette.background.paper}`,
    },
}));

interface HelpMenuHintProps {
    open: boolean;
    anchorEl: HTMLElement | null;
    onClose: () => void;
    children: React.ReactNode;
}

export const HelpMenuHint = ({
    open,
    anchorEl,
    onClose,
    children,
}: HelpMenuHintProps) => (
    <HintPopper
        open={open}
        anchorEl={anchorEl}
        placement='bottom-end'
        transition
    >
        {({ TransitionProps }) => (
            <ClickAwayListener onClickAway={onClose}>
                <Grow
                    {...TransitionProps}
                    style={{ transformOrigin: 'top right' }}
                    timeout={200}
                >
                    <HintPaper>{children}</HintPaper>
                </Grow>
            </ClickAwayListener>
        )}
    </HintPopper>
);
