import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    environmentContainer: {
        display: 'flex',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        width: '100%',
        position: 'relative',
        justifyContent: 'center',
    },
    environmentMetrics: {
        border: `1px solid ${theme.palette.grey[300]}`,
        margin: '1rem',
        width: '30%',
    },
    [theme.breakpoints.down(1000)]: {
        environmentMetrics: { width: '60%' },
    },
    [theme.breakpoints.down(750)]: {
        environmentMetrics: { width: '100%' },
    },
    secondaryContent: {
        marginTop: '1rem',
    },
}));
