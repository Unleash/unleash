import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    constraints: {
        marginTop: '1rem',
    },
    constraintContainer: {
        backgroundColor: theme.palette.cards.container.bg,
        margin: '0.5rem 0',
        borderRadius: theme.borders.radius.main,
        padding: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        '& span': {
            marginRight: '0.4rem',
            fontSize: '0.9rem',
        },
    },
    placeholderText: {
        marginTop: '0.25rem',
    },
    link: {
        display: 'block',
        marginTop: '0.2rem',
    },
}));
