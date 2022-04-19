import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'grid',
        lineHeight: 1.25,
        gridTemplateColumns: '1fr auto',
        alignSelf: 'start',
        alignItems: 'start',
        gap: '0.5rem',
        padding: '0.5rem',
        background: theme.palette.grey[200],
        borderRadius: theme.borders.radius.main,
    },
    label: {
        fontSize: theme.fontSizes.smallBody,
    },
    description: {
        fontSize: theme.fontSizes.smallerBody,
        color: theme.palette.grey[700],
    },
    button: {
        all: 'unset',
        lineHeight: 0.1,
        paddingTop: 1,
        display: 'block',
        cursor: 'pointer',
        '& svg': {
            fontSize: '1rem',
            opacity: 0.5,
        },
        '&:hover svg, &:focus-visible svg': {
            opacity: 0.75,
        },
    },
}));
