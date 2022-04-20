import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    tableCellHeaderSortable: {
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: theme.v2.palette.grey[40],
            '& > svg': {
                color: theme.v2.palette.grey[90],
            },
        },
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
}));
