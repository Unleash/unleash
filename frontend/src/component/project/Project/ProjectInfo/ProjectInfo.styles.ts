import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    projectInfo: {
        width: '225px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: 'none',
        [theme.breakpoints.down('md')]: {
            flexDirection: 'row',
            alignItems: 'stretch',
            width: '100%',
            marginBottom: '1rem',
        },
    },
    description: {
        textAlign: 'left',
        marginBottom: '0.5rem',
    },
    descriptionContainer: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    idContainer: {
        display: 'flex',
        width: '100%',
        textAlign: 'left',
        wordBreak: 'break-all',
    },
    percentageContainer: {
        display: 'flex',
        justifyContent: 'center',
        margin: '1rem 0',
    },
    projectIcon: {
        margin: '2rem 0',
        [theme.breakpoints.down('md')]: {
            margin: '0 0 0.25rem 0',
            width: '53px',
        },
    },
    subtitle: {
        marginBottom: '1rem',
    },
    emphazisedText: {
        fontSize: '1.5rem',
        marginBottom: '1rem',
        [theme.breakpoints.down('md')]: {
            fontSize: '1rem',
            marginBottom: '2rem',
        },
    },
    infoSection: {
        margin: '0',
        textAlign: 'center',
        marginBottom: '1rem',
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadiusLarge,
        width: '100%',
        padding: '1.5rem 1rem 1.5rem 1rem',
        [theme.breakpoints.down('md')]: {
            margin: '0 0.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            position: 'relative',
            padding: '0.8rem',
            '&:first-of-type': {
                marginLeft: '0',
            },
            '&:last-of-type': {
                marginRight: '0',
            },
        },
    },
    arrowIcon: {
        color: '#635dc5',
        marginLeft: '0.5rem',
    },
    permissionButtonShortDesc: {
        transform: `translateY(-10px)`,
    },
    infoLink: {
        textDecoration: 'none',
        color: '#635dc5',
        [theme.breakpoints.down('md')]: {
            position: 'absolute',
            bottom: '5px',
        },
    },
    accordion: {
        boxShadow: 'none',
        textAlign: 'left',
    },
    accordionBody: { padding: '0', wordBreak: 'break-all' },
    accordionActions: {
        padding: '0',
        justifyContent: 'flex-start',
    },
    linkText: {
        [theme.breakpoints.down('md')]: {
            display: 'none',
        },
    },
}));
