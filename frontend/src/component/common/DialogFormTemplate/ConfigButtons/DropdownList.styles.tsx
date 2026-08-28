import { Checkbox, ListItem, styled } from '@mui/material';
import Check from '@mui/icons-material/Check';

export const StyledHeader = styled('div')(({ theme }) => ({
    paddingInline: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
}));

export const StyledHeaderTitle = styled('p')(({ theme }) => ({
    margin: 0,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.typography.body2.fontSize,
}));

export const StyledHeaderDescription = styled('p')(({ theme }) => ({
    margin: 0,
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
}));

export const StyledOptionDescription = styled('span')(({ theme }) => ({
    display: 'block',
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    whiteSpace: 'normal',
}));

export const StyledListItem = styled(ListItem)(({ theme }) => ({
    paddingLeft: theme.spacing(2),
    paddingBlock: theme.spacing(1),
    cursor: 'pointer',

    '&:hover, &:focus': {
        backgroundColor: theme.palette.action.hover,
        outline: 'none',
    },
    minHeight: theme.spacing(4.5),
}));

export const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
    padding: theme.spacing(1, 1, 1, 1.5),
}));

export const StyledSelectedIcon = styled(Check)(({ theme }) => ({
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(1),
}));
