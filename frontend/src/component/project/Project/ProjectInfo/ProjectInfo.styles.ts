import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    projectInfo: {
        width: '225px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: 'none',
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'row',
            alignItems: 'stretch',
            width: '100%',
            marginBottom: '1rem',
        },
    },
    percentageContainer: {
        display: 'flex',
        justifyContent: 'center',
        margin: '1rem 0',
    },
    projectIcon: {
        margin: '2rem 0',
        [theme.breakpoints.down('sm')]: {
            margin: '0 0 0.25rem 0',
            width: '53px',
        },
    },
    subtitle: {
        marginBottom: '1.25rem',
    },
    emphazisedText: {
        fontSize: '1.5rem',
        marginBottom: '1rem',
        [theme.breakpoints.down('sm')]: {
            fontSize: '1rem',
            marginBottom: '2rem',
        },
    },
    infoSection: {
        margin: '0',
        textAlign: 'center',
        marginBottom: '1rem',
        backgroundColor: '#fff',
        borderRadius: '10px',
        width: '100%',
        padding: '1.5rem 1rem 1.5rem 1rem',
        [theme.breakpoints.down('sm')]: {
            margin: '0 0.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            position: 'relative',
            padding: '0.8rem',
            ['&:first-child']: {
                marginLeft: '0',
            },
            ['&:last-child']: {
                marginRight: '0',
            },
        },
    },
    arrowIcon: {
        color: '#635dc5',
        marginLeft: '0.5rem',
    },
    infoLink: {
        textDecoration: 'none',
        color: '#635dc5',
        [theme.breakpoints.down('sm')]: {
            position: 'absolute',
            bottom: '5px',
        },
    },
    linkText: {
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
}));
