import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    item: {
        padding: theme.spacing(2),
        background: 'transparent',
        borderRadius: theme.spacing(2),
        textAlign: 'center',
        [theme.breakpoints.up('md')]: {
            padding: theme.spacing(4),
        },
    },
    title: {
        margin: 0,
        fontSize: theme.fontSizes.bodySize,
        fontWeight: theme.fontWeight.thin,
    },
    value: {
        fontSize: '2.25rem',
        fontWeight: theme.fontWeight.bold,
        color: theme.palette.primary.main,
    },
    text: {
        margin: '.5rem 0 0 0',
        padding: '1rem 0 0 0',
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderTopColor: theme.palette.grey[300],
        fontSize: theme.fontSizes.smallerBody,
        color: theme.palette.grey[800],
    },
}));
