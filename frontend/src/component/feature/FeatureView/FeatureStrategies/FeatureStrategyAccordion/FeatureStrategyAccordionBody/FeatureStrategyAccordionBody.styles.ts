import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    addConstraintBtn: {
        color: theme.palette.primary.main,
        fontWeight: 'normal',
        marginBottom: '0.5rem',
    },
    accordionContainer: {
        width: '100%',
        paddingRight: '37px',
        [theme.breakpoints.down(800)]: {
            width: '100%',
        },
    },
    constraintHeader: {
        fontWeight: 'bold',
        fontSize: theme.fontSizes.smallBody,
    },
    noConstraints: {
        marginTop: '0.5rem',
        fontSize: theme.fontSizes.smallBody,
    },
}));
