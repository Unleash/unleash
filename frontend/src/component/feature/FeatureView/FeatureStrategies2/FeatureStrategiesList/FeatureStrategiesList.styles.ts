import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    sidebar: {
        width: '500px',
        padding: '2rem',
        borderRight: `1px solid ${theme.palette.grey[300]}`,
        transition: 'width 0.3s ease',
        position: 'relative',
        minHeight: '400px',
        [theme.breakpoints.down(900)]: {
            width: '50%',
        },
        [theme.breakpoints.down(700)]: {
            padding: '1rem',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
    },
    mobileNavContainer: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
        padding: '1rem',
    },
}));
