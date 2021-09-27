import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        position: 'relative',
        width: '100%',
        height: '25px',
        marginTop: '1rem',
    },
    separatorBorder: {
        height: '1px',
        borderBottom: `2px dotted ${theme.palette.primary.main}`,
        width: '100%',
        top: '0',
    },
    textContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
    textPositioning: { position: 'absolute', top: '-20px', zIndex: 300 },
}));
