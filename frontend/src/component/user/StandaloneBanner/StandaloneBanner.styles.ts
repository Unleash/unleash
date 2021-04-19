import { makeStyles } from '@material-ui/styles';

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
    },
    switchesContainer: {
        position: 'fixed',
        bottom: '40px',
        display: 'flex',
        flexDirection: 'column',
    },
    switchIcon: {
        height: '180px',
    },
    bottomStar: {
        position: 'absolute',
        bottom: '-54px',
        left: '100px',
    },
    bottomRightStar: {
        position: 'absolute',
        bottom: '-100px',
        left: '200px',
    },
    midRightStar: {
        position: 'absolute',
        bottom: '-80px',
        left: '300px',
    },
    midLeftStar: {
        position: 'absolute',
        top: '10px',
        left: '150px',
    },
    midLeftStarTwo: {
        position: 'absolute',
        top: '25px',
        left: '350px',
    },
}));
