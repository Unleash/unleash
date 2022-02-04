import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    editableContainer: {
        position: 'relative',
    },
    unsaved: {
        position: 'absolute',
        top: '-12.5px',
        right: '175px',
        backgroundColor: theme.palette.primary.main,
        color: '#fff',
        padding: '0.15rem 0.2rem',
        borderRadius: '3px',
        fontSize: theme.fontSizes.smallerBody,
        zIndex: 400,
        [theme.breakpoints.down(500)]: {
            right: 100,
        },
    },
    buttonContainer: {
        display: 'flex',
        alignItems: 'center',
        marginTop: '1rem',
        [theme.breakpoints.down(500)]: {
            flexDirection: 'column',
        },
    },
    editButton: {
        margin: '0 1rem 0 0',
        [theme.breakpoints.down(500)]: {
            width: '100%',
            margin: '0.4rem 0',
        },
    },
}));
