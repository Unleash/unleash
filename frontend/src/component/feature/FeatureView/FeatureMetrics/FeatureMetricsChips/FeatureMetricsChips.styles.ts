import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    title: {
        margin: 0,
        marginBottom: '.5rem',
        fontSize: theme.fontSizes.smallerBody,
        fontWeight: theme.fontWeight.thin,
        color: theme.palette.grey[600],
    },
    list: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '.5rem',
        listStyleType: 'none',
        padding: 0,
        minHeight: '100%',
    },
    item: {
        '& > [aria-pressed=true]': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
        },
        '& > :is(:focus-visible, :active)': {
            outline: 0,
            outlineStyle: 'solid',
            outlineWidth: 2,
            outlineOffset: 2,
            outlineColor: theme.palette.primary.main,
        },
    },
}));
