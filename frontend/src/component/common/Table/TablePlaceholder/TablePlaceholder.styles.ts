import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    emptyStateListItem: {
        border: `2px dashed ${theme.palette.grey[100]}`,
        padding: '0.8rem',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing(2),
    },
}));
