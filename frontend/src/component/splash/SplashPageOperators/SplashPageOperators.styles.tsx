import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        backgroundColor: theme.palette.primary.light,
        minHeight: '100vh',
        padding: '1rem',
        display: 'grid',
        gap: '1rem',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        gridTemplateColumns: 'minmax(0,auto)',
        fontWeight: theme.fontWeight.thin,
    },
    content: {
        position: 'relative',
        padding: '2rem',
        borderRadius: '0.5rem',
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        [theme.breakpoints.up('md')]: {
            padding: '4rem',
        },
    },
    header: {
        textAlign: 'center',
    },
    footer: {
        display: 'grid',
        gap: '2rem',
        textAlign: 'center',
        justifyItems: 'center',
    },
    body: {
        margin: '2rem 0',
        padding: '2rem 0',
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderTopColor: theme.palette.primary.light,
        borderBottomColor: theme.palette.primary.light,
    },
    close: {
        position: 'absolute',
        top: 0,
        right: 0,
        color: 'inherit',
    },
    title: {
        fontWeight: 'inherit',
    },
    ingress: {
        maxWidth: '32rem',
        margin: '1.5rem auto 0 auto',
    },
    list: {
        padding: '1rem 0',
        [theme.breakpoints.up('md')]: {
            padding: '1rem 2rem',
        },
        '& li + li': {
            marginTop: '0.25rem',
        },
        '& strong': {
            padding: '0 .2rem',
            fontSize: theme.fontSizes.smallBody,
            fontWeight: 'inherit',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
        },
    },
    link: {
        color: 'inherit',
    },
    button: {
        background: 'white !important',
        color: theme.palette.primary.main,
    },
}));
