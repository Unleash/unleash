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
    },
    buttonContainer: {
        display: 'flex',
        alignItems: 'center',
        marginTop: '1rem',
    },
}));
