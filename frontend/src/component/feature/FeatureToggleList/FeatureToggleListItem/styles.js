import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    listItem: {
        padding: '0',
        margin: '1rem 0',
    },
    listItemMetric: {
        width: '40px',
        marginRight: '0.25rem',
        flexShrink: '0',
    },
    listItemType: {
        width: '40px',
        textAlign: 'center',
    },
    listItemSvg: {
        fill: theme.palette.icons.lightGrey,
    },
    listItemLink: {
        marginLeft: '10px',
        minWidth: '0',
    },
    listItemStrategies: {
        marginLeft: 'auto',
    },
}));
