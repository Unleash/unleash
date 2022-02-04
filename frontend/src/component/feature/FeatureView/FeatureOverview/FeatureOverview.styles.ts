import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: { display: 'flex', width: '100%' },

    mainContent: {
        display: 'flex',
        flexDirection: 'column',
        width: `calc(100% - (350px + 1rem))`,
    },
    trafficContainer: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    [theme.breakpoints.down(1000)]: {
        container: {
            flexDirection: 'column',
        },
        trafficContainer: {
            marginTop: '1rem',
        },
        mainContent: {
            width: '100%',
        },
    },
}));
