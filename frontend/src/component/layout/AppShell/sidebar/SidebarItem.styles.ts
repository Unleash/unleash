import { styled, type Theme } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { PendingAccessRequestsIndicator } from 'component/admin/users/AccessRequestsNotifications/PendingAccessRequestsIndicator';

export const SUB_ITEM_INDENT = 3.875;

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
    '&[aria-current="page"]': {
        backgroundColor: theme.palette.action.selected,
        fontWeight: theme.typography.fontWeightBold,
    },
});

export const SidebarItemIcon = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    color: theme.palette.text.secondary,
    '& svg': {
        fontSize: theme.spacing(2.25),
    },
}));

export const SidebarCaret = styled(ArrowDropDownIcon, {
    shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded: boolean }>(({ theme, expanded }) => ({
    flex: 'none',
    fontSize: theme.spacing(2),
    color: theme.palette.text.secondary,
    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

// Moves the dot closer to the text and a bit lower, so it doesn't touch the top edge of the hover highlight.
export const SidebarPendingAccessRequestsIndicator = styled(
    PendingAccessRequestsIndicator,
)(({ theme }) => ({
    marginLeft: theme.spacing(-0.375),
    marginTop: theme.spacing(0.5),
}));
