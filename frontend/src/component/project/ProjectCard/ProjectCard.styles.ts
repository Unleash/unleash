import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    projectCard: {
        padding: '1rem',
        width: '220px',
        height: '204px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        margin: '0.5rem',
        boxShadow: 'none',
        border: '1px solid #efefef',
        [theme.breakpoints.down('xs')]: {
            justifyContent: 'center',
        },
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontWeight: 'normal',
        fontSize: '1rem',
    },
    projectIcon: {
        margin: '1rem auto',
        width: '80px',
        display: 'block',
    },
    info: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
    },
    infoBox: {
        textAlign: 'center',
    },
    infoStats: {
        color: '#4A4599',
        fontWeight: 'bold',
    },
    actionsBtn: {
        transform: 'translateX(15px)',
    },
    icon: {
        color: theme.palette.grey[700],
        marginRight: '0.5rem',
    },
}));
