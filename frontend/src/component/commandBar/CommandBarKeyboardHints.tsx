import { styled } from '@mui/material';

const StyledHints = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2.5, 0),
    borderTop: `1px solid ${theme.palette.divider}`,
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    [theme.breakpoints.down('md')]: {
        display: 'none',
    },
}));

const StyledHint = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const StyledKey = styled('kbd')(({ theme }) => ({
    minWidth: theme.spacing(2.5),
    padding: theme.spacing(0, 0.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.elevation1,
    fontFamily: 'inherit',
    textAlign: 'center',
}));

export const CommandBarKeyboardHints = () => (
    <StyledHints aria-hidden>
        <StyledHint>
            <StyledKey>↑</StyledKey>
            <StyledKey>↓</StyledKey>
            to navigate
        </StyledHint>
        <StyledHint>
            <StyledKey>↵</StyledKey>
            to open
        </StyledHint>
        <StyledHint>
            <StyledKey>Esc</StyledKey>
            to close
        </StyledHint>
    </StyledHints>
);
