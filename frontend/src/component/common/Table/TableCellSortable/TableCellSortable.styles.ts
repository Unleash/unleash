import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    tableCellHeaderSortable: {
        padding: 0,
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        '& > svg': {
            fontSize: theme.v2.fontSizes.headerIcon,
            verticalAlign: 'middle',
            color: theme.v2.palette.grey[70],
            marginLeft: '4px',
        },
        '&.sorted': {
            fontWeight: 'bold',
            '& > svg': {
                color: theme.v2.palette.grey[90],
            },
        },
    },
    sortButton: {
        all: 'unset',
        padding: theme.spacing(2),
        width: '100%',
        '&:focus-visible, &:active': {
            outline: 'revert',
        },
        display: 'flex',
        alignItems: 'center',
        '&:hover': {
            backgroundColor: theme.v2.palette.grey[40],
            '& > svg': {
                color: theme.v2.palette.grey[90],
            },
        },
    },
    icon: {
        marginLeft: theme.spacing(0.5),
        fontSize: theme.v2.fontSizes.headerIcon,
    },
}));
