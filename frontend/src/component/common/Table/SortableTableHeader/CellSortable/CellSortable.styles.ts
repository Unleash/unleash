import { styled, TableCell } from '@mui/material';
import { focusable } from 'themes/themeStyles';

export const StyledTableCell = styled(TableCell, {
    shouldForwardProp: prop =>
        prop !== 'isFlex' && prop !== 'isSortable' && prop !== 'isFlexGrow',
})<{
    isFlex?: boolean;
    isSortable?: boolean;
    isFlexGrow?: boolean;
}>(({ theme, isFlex, isSortable, isFlexGrow }) => ({
    position: 'relative',
    fontWeight: theme.typography.fontWeightRegular,
    ...(isFlex && {
        justifyContent: 'stretch',
        alignItems: 'center',
        display: 'flex',
        flexShrink: 0,
        '& > *': {
            flexGrow: 1,
        },
    }),
    ...(isSortable && {
        padding: 0,
        '&:hover, &:focus': {
            backgroundColor: theme.palette.table.headerHover,
            '& svg': {
                color: 'inherit',
            },
        },
    }),
    ...(isFlexGrow && {
        flexGrow: 1,
    }),
}));

export const StyledButton = styled('button', {
    shouldForwardProp: prop => prop !== 'isSorted',
})<{ isSorted?: boolean }>(({ theme, isSorted }) => ({
    ...focusable(theme),
    all: 'unset',
    whiteSpace: 'nowrap',
    width: '100%',
    position: 'relative',
    zIndex: 1,
    ':hover, :focus, &:focus-visible, &:active': {
        '.hover-only': {
            display: 'inline-block',
        },
    },
    display: 'flex',
    boxSizing: 'inherit',
    cursor: 'pointer',
    ...(isSorted && {
        fontWeight: theme.typography.fontWeightBold,
    }),
}));

export const StyledLabel = styled('span')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 1,
    minWidth: 0,
    '::after': {
        fontWeight: 'bold',
        display: 'inline-block',
        height: 0,
        content: 'attr(data-text)',
        visibility: 'hidden',
        overflow: 'hidden',
    },
}));

export const StyledHiddenMeasurementLayer = styled('span')(({ theme }) => ({
    padding: theme.spacing(2),
    visibility: 'hidden',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
}));

export const StyledVisibleAbsoluteLayer = styled('span')(({ theme }) => ({
    padding: theme.spacing(2),
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    '.hover-only': {
        display: 'none',
    },
    '& > span': {
        minWidth: 0,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflowX: 'hidden',
        overflowY: 'visible',
    },
}));
