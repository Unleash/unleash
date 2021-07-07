import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    projectInfo: {
        width: '275px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: 'none',
    },
    subtitle: {
        marginBottom: '1.25rem',
    },
    emphazisedText: {
        fontSize: '1.5rem',
        marginBottom: '1rem',
    },
    infoSection: {
        margin: '1.8rem 0',
        textAlign: 'center',
    },
    arrowIcon: {
        color: '#635dc5',
        marginLeft: '0.5rem',
    },
    infoLink: {
        textDecoration: 'none',
        color: '#635dc5',
    },
}));
