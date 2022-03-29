import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    form: {
        display: 'grid',
        gap: '1rem',
    },
    hr: {
        width: '100%',
        height: 1,
        margin: '1rem 0',
        border: 'none',
        background: theme.palette.grey[200],
    },
    title: {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gridGap: '.5rem',
        fontSize: theme.fontSizes.subHeader,
    },
    icon: {
        color: theme.palette.primary.main,
    },
    name: {
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontWeight: theme.fontWeight.thin,
    },
    buttons: {
        display: 'flex',
        justifyContent: 'end',
        gap: '1rem',
        paddingBottom: '5rem',
    },
}));
