import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    header: {
        position: 'relative',
        fontWeight: theme.fontWeight.medium,
    },
    flex: {
        justifyContent: 'stretch',
        alignItems: 'center',
        display: 'flex',
        flexShrink: 0,
        '& > *': {
            flexGrow: 1,
        },
    },
    flexGrow: {
        flexGrow: 1,
    },
    sortable: {
        padding: 0,
        '&:hover, &:focus': {
            backgroundColor: theme.palette.tableHeaderHover,
            '& svg': {
                color: 'inherit',
            },
        },
    },
    sortButton: {
        all: 'unset',
        whiteSpace: 'nowrap',
        width: '100%',
        position: 'relative',
        zIndex: 1,
        ':hover, :focus, &:focus-visible, &:active': {
            outline: 'revert',
            '.hover-only': {
                display: 'inline-block',
            },
        },
        display: 'flex',
        boxSizing: 'inherit',
        cursor: 'pointer',
    },
    sortedButton: {
        fontWeight: theme.fontWeight.bold,
    },
    label: {
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
    },
    alignLeft: {
        justifyContent: 'flex-start',
        textAlign: 'left',
    },
    alignRight: {
        justifyContent: 'flex-end',
        textAlign: 'right',
    },
    alignCenter: {
        justifyContent: 'center',
        textAlign: 'center',
    },
    hiddenMeasurementLayer: {
        padding: theme.spacing(2),
        visibility: 'hidden',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
    },
    visibleAbsoluteLayer: {
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
    },
}));
