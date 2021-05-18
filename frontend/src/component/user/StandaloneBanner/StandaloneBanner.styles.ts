import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    title: {
        color: '#fff',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
    },
    container: {
        padding: '4rem 2rem',
        color: '#fff',
        position: 'relative',
        [theme.breakpoints.down('sm')]: {
            padding: '3rem 2rem',
        },
        [theme.breakpoints.down('xs')]: {
            padding: '3rem 1rem',
        },
    },
    switchesContainer: {
        position: 'absolute',
        bottom: '40px',
        display: 'flex',
        flexDirection: 'column',
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    switchIcon: {
        height: '180px',
    },
    bottomStar: {
        position: 'absolute',
        bottom: '-54px',
        left: '100px',
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    bottomRightStar: {
        position: 'absolute',
        bottom: '-100px',
        left: '200px',
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    midRightStar: {
        position: 'absolute',
        bottom: '-80px',
        left: '300px',
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    midLeftStar: {
        position: 'absolute',
        top: '10px',
        left: '150px',
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    midLeftStarTwo: {
        position: 'absolute',
        top: '25px',
        left: '350px',
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
}));
