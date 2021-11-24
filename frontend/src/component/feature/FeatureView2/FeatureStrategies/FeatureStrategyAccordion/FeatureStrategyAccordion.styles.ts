import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        border: `1px solid ${theme.palette.grey[300]}`,
        borderRadius: '5px',
        transition: 'transform 0.3s ease',
        transitionDelay: '0.1s',
        position: 'relative',
    },
    unsaved: {
        position: 'absolute',
        top: '-12.5px',
        right: '175px',
        backgroundColor: theme.palette.primary.main,
        color: '#fff',
        padding: '0.15rem 0.2rem',
        borderRadius: '3px',
        fontSize: theme.fontSizes.smallerBody,
    },
    accordion: {
        boxShadow: 'none',
    },
    accordionSummary: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
    },
    accordionHeader: {
        maxWidth: '200px',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        [theme.breakpoints.down(700)]: {
            maxWidth: '100px',
            fontSize: theme.fontSizes.smallBody,
        },
    },
    accordionActions: {
        marginLeft: 'auto',
    },
    icon: {
        fill: theme.palette.primary.main,
        minWidth: '50px',
    },
    rollout: {
        fontSize: theme.fontSizes.smallBody,
        marginLeft: '0.5rem',
    },
    accordionDetails: {
        width: '100%',
    },
}));
