import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: { display: 'flex', width: '100%' },
    [theme.breakpoints.down(800)]: {
        container: {
            flexDirection: 'column',
        },
        trafficContainer: {
            marginTop: '1rem',
        },
    },
    mainContent: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    trafficContainer: {
        display: 'flex',
        flexWrap: 'wrap',
    },
}));
