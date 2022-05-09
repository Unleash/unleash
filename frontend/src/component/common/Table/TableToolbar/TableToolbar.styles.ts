import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    toolbar: {
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    actions: {
        flex: 1,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    verticalSeparator: {
        height: '100%',
        borderColor: theme.palette.grey[500],
        width: '1px',
        display: 'inline-block',
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(4),
        padding: '10px 0',
        verticalAlign: 'middle',
    },
}));
