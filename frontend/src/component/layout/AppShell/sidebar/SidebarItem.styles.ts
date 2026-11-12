import { styled, type Theme } from '@mui/material';

export const sidebarItemStyles = (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: theme.spacing(0.875),
    width: '100%',
    minHeight: 28,
    padding: theme.spacing(0.25, 0.5),
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.primary,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    lineHeight: '24px',
    textAlign: 'left' as const,
    textDecoration: 'none',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-focusVisible, &:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: -2,
    },
});

export const SidebarItemIcon = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    color: theme.palette.text.secondary,
    '& svg': {
        fontSize: theme.spacing(2.25),
    },
}));
