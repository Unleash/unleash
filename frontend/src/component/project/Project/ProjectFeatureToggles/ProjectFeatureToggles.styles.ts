import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        boxShadow: 'none',
        marginLeft: '1rem',
        minHeight: '100%',
        width: 'calc(100% - 1rem)',
        position: 'relative',
        [theme.breakpoints.down('md')]: {
            marginLeft: '0',
            paddingBottom: '4rem',
            width: 'inherit',
        },
    },
    headerClass: {
        '& th': {
            fontSize: theme.fontSizes.smallerBody,
            lineHeight: '1rem',
        },
    },
    bodyClass: {
        overflowX: 'auto',
        padding: theme.spacing(4),
    },
    header: {
        padding: '1rem',
    },
    title: {
        display: 'unset',
    },
    iconButton: {
        marginRight: '1rem',
    },
    icon: {
        color: '#000',
        height: '30px',
        width: '30px',
    },
    noTogglesFound: {
        marginBottom: '0.5rem',
    },
    link: {
        textDecoration: 'none',
        color: theme.palette.primary.main,
    },
    actionsContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    search: {
        border: `1px solid ${theme.palette.grey[300]}`,
        height: 35,
        marginRight: '2rem',
    },
    button: {
        whiteSpace: 'nowrap',
    },
    row: {
        position: 'absolute',
        width: '100%',
    },
    cell: {
        alignItems: 'center',
        display: 'flex',
        flexShrink: 0,
        '& > *': {
            flexGrow: 1,
        },
    },
}));
