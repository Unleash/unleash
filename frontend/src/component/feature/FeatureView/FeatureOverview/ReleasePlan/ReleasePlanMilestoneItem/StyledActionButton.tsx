import { Button, styled } from '@mui/material';

export const StyledActionButton = styled(Button)(({ theme }) => ({
    textTransform: 'none',
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body2.fontSize,
    padding: 0,
    minWidth: 'auto',
    gap: theme.spacing(1),
    '&:hover': {
        backgroundColor: 'transparent',
    },
    // Doubled `&&` so this bespoke start-icon styling out-specifies the global
    // `MuiButton` start-icon rule in the theme, which would otherwise blow the
    // decorative "+" up to the standard 24px and override its margin.
    '&& .MuiButton-startIcon': {
        margin: 0,
        width: 20,
        height: 20,
        border: `1px solid ${theme.palette.primary.main}`,
        backgroundColor: theme.palette.background.elevation2,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& svg': {
            fontSize: 16,
            color: theme.palette.primary.main,
        },
    },
}));
