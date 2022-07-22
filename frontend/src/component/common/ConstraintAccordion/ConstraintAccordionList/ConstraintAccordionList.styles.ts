import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        width: '100%',
        display: 'grid',
        gap: '1rem',
    },
    help: {
        fill: theme.palette.grey[600],
        [theme.breakpoints.down(860)]: {
            display: 'none',
        },
        marginLeft: '0.75rem',
    },
    addCustomLabel: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'start',
        margin: '0.75rem 0'
    }
}));
