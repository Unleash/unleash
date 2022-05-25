import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    icon: {
        marginLeft: theme.spacing(0.25),
        marginRight: theme.spacing(-0.5),
        color: theme.palette.grey[700],
        fontSize: theme.fontSizes.mainHeader,
        verticalAlign: 'middle',
    },
    sorted: {
        color: theme.palette.grey[900],
    },
}));
