import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        marginBottom: '2rem',
        border: `1px solid ${theme.palette.grey[300]}`,
        borderRadius: '5px',
        position: 'relative',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.palette.grey[300]}`,
        padding: '1rem',
    },
    icon: {
        fill: '#fff',
        height: '17.5px',
        width: '17.5px',
    },
    strategiesContainer: {
        padding: '1rem 0',
        ['& > *']: {
            margin: '0.5rem 0',
        },
    },
    environmentIdentifier: {
        position: 'absolute',
        right: '42.5%',
        top: '-25px',
        display: 'flex',
        background: theme.palette.primary.light,
        borderRadius: '25px',
        padding: '0.4rem 1rem',
        minWidth: '150px',
        color: '#fff',

        alignItems: 'center',
    },
    environmentBadgeParagraph: {
        fontSize: theme.fontSizes.smallBody,
    },
    iconContainer: {
        padding: '0.25rem',
        borderRadius: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        border: '1px solid #fff',
        marginRight: '0.5rem',
    },
    body: {
        padding: '1rem',
    },
    disabledEnvContainer: {
        backgroundColor: theme.palette.grey[300],
        color: theme.palette.grey[600],
    },
    disabledIconContainer: {
        border: `1px solid ${theme.palette.grey[500]}`,
    },
    iconDisabled: {
        fill: theme.palette.grey[500],
    },

    toggleText: {
        fontSize: theme.fontSizes.smallBody,
    },
    toggleLink: {
        color: theme.palette.primary.main,
        fontSize: theme.fontSizes.smallBody,
    },
    headerDisabledEnv: {
        border: 'none',
    },
}));
