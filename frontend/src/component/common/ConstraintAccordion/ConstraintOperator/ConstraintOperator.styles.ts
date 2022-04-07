import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        padding: '0.5rem 0.75rem',
        borderRadius: theme.borders.radius.main,
        backgroundColor: theme.palette.grey[200],
        lineHeight: 1.25,
    },
    name: {
        fontSize: theme.fontSizes.smallBody,
    },
    text: {
        fontSize: theme.fontSizes.smallerBody,
        color: theme.palette.grey[700],
    },
    not: {
        display: 'block',
        margin: '-1rem 0 0.25rem 0',
        height: '1rem',
        '& > span': {
            display: 'inline-block',
            padding: '0 0.25rem',
            borderRadius: theme.borders.radius.main,
            fontSize: theme.fontSizes.smallerBody,
            backgroundColor: theme.palette.primary.light,
            color: 'white',
        },
    },
}));
