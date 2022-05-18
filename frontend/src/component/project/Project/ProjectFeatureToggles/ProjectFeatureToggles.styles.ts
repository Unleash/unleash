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
            // fix for padding with different font size in hovered column header
            'span[data-tooltip] span': {
                padding: '4px 0',
                display: 'block',
            },
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
        [theme.breakpoints.down(600)]: {
            display: 'none',
        },
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
}));
