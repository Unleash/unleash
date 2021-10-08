import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        marginTop: '2rem',
        marginBottom: '5rem',
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
    headerInfo: {
        marginRight: '1rem',
    },

    icon: {
        fill: '#fff',
        height: '14px',
        width: '14px',
    },
    strategiesContainer: {
        padding: '1rem 0',
        ['& > *']: {
            margin: '0.5rem 0',
        },
    },
    environmentIdentifier: {
        position: 'absolute',
        right: '0',
        left: '0',
        margin: '0 auto',
        width: '150px',
        top: '-25px',
        display: 'flex',
        background: '#fff',
        border: `1px solid ${theme.palette.primary.light}`,
        borderRadius: '25px',
        padding: '0.25rem 1rem',
        minWidth: '150px',
        color: theme.palette.primary.light,
        alignItems: 'center',
        justifyContent: 'center',
    },
    environmentTitle: {
        maxWidth: '100px',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    textContainer: {
        display: 'flex',
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
        background: theme.palette.primary.light,
        border: `1px solid ${theme.palette.primary.light}`,
        marginRight: '0.5rem',
    },
    body: {
        padding: '1rem',
    },
    disabledEnvContainer: {
        color: theme.palette.grey[500],
        border: `1px solid ${theme.palette.grey[400]}`,

        backgroundColor: '#fff',
    },
    disabledIconContainer: {
        border: `1px solid ${theme.palette.grey[400]}`,
        background: theme.palette.grey[400],
    },
    iconDisabled: {
        fill: '#fff',
    },
    toggleText: {
        fontSize: theme.fontSizes.smallBody,
        wordBreak: 'break-all',
        maxWidth: '300px',
    },
    toggleLink: {
        color: theme.palette.primary.main,
        fontSize: theme.fontSizes.smallBody,
        wordBreak: 'break-word',
    },
    headerDisabledEnv: {
        border: 'none',
    },
    [theme.breakpoints.down(1000)]: {
        toggleLink: {
            marginTop: '1rem',
            display: 'block',
        },
    },
}));
