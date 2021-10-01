import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    card: {
        border: `1px solid ${theme.palette.grey[300]}`,
        borderRadius: '5px',
        transition: 'transform 0.3s ease',
        transitionDelay: '0.1s',
        position: 'relative',
        background: 'transparent',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem',
        fontSize: theme.fontSizes.bodySize,
    },
    cardHeader: {
        maxWidth: '200px',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        [theme.breakpoints.down(700)]: {
            maxWidth: '100px',
            fontSize: theme.fontSizes.smallBody,
        },
    },
    icon: {
        marginRight: '0.5rem',
        fill: theme.palette.primary.main,
        minWidth: '35px',
    },
    rollout: {
        fontSize: theme.fontSizes.smallBody,
        marginLeft: '0.5rem',
    },
}));
