import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    profile: {
        position: 'absolute',
        zIndex: '5000',
        minWidth: '300px',
        right: 0,
        padding: '1.5rem',
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            padding: '1rem',
        },
    },
    avatar: {
        width: '40px',
        height: '40px',
        transition: 'transform 0.4s ease',
    },
    editingAvatar: {
        transform: 'translateX(-102px) translateY(-9px)',
    },
    profileEmail: {
        transition: 'transform 0.4s ease',
    },
    editingEmail: {
        transform: 'translateX(10px) translateY(-60px)',
    },
    link: {
        color: theme.palette.primary.main,
        textDecoration: 'none',
        textAlign: 'left',
        width: '100%',
    },
}));
