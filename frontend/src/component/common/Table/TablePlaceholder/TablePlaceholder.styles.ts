import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    emptyStateListItem: {
        border: `2px dashed ${theme.palette.neutral.light}`,
        padding: '0.8rem',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing(2),
        width: '100%',
    },
}));
