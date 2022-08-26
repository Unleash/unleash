import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        display: 'flex',
        width: '100%',
        [theme.breakpoints.down(1000)]: {
            flexDirection: 'column',
        },
    },
    mainContent: {
        display: 'flex',
        flexDirection: 'column',
        width: `calc(100% - (350px + 1rem))`,
        [theme.breakpoints.down(1000)]: {
            width: '100%',
        },
    },
    trafficContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        [theme.breakpoints.down(1000)]: {
            marginTop: '1rem',
        },
    },
}));
