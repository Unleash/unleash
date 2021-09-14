import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    subheader: {
        fontSize: theme.fontSizes.subHeader,
        fontWeight: 'normal',
        marginTop: '2rem',
    },
    container: {
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
    },
    nextSteps: {
        display: 'flex',
    },
    step: { maxWidth: '350px', margin: '0 1.5rem', position: 'relative' },
    stepBadge: {
        backgroundColor: theme.palette.primary.main,
        width: '30px',
        height: '30px',
        borderRadius: '25px',
        color: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold',
        margin: '2rem auto',
    },
    stepParagraph: {
        marginBottom: '1rem',
    },
    button: {
        marginTop: '2.5rem',
        minWidth: '150px',
    },
    link: {
        color: theme.palette.primary.main,
    },
}));
