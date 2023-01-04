import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    title: {
        margin: 0,
        marginBottom: theme.spacing(1),
        fontSize: theme.fontSizes.smallBody,
        fontWeight: theme.fontWeight.thin,
        color: theme.palette.text.secondary,
    },
    list: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing(1),
        listStyleType: 'none',
        padding: 0,
        minHeight: '100%',
    },
    item: {
        '& > [aria-pressed=true]': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
        },
    },
}));
