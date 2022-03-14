import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    form: {
        '& > * + *': {
            paddingTop: theme.spacing(4),
            marginTop: theme.spacing(4),
            borderTopStyle: 'solid',
            borderTopWidth: 1,
            borderTopColor: theme.palette.grey[200],
        },
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
    },
}));
