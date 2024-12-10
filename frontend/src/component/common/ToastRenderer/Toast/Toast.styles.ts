import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
    container: {
        alignItems: 'center',
        background:
            // the background color for this doesn't exist in the theme yet and it's not synchronized across dark/light modes yet.
            theme.mode === 'light' ? '#201E42' : theme.palette.background.paper,

        borderRadius: theme.shape.borderRadiusMedium,
        boxShadow: theme.boxShadows.popup,
        display: 'flex',
        flexDirection: 'row',
        gap: theme.spacing(2),
        margin: '0 0.8rem',
        maxWidth: '450px',
        padding: theme.spacing(1),
        paddingLeft: theme.spacing(2),
        zIndex: theme.zIndex.snackbar,
        color: theme.palette.common.white,
    },
    starting: {
        opacity: 0,
    },
    headerStyles: {
        fontSize: theme.typography.body1.fontSize,
        fontWeight: 'normal',
        margin: 0,
        maxHeight: '75vh',
        overflowY: 'auto',
    },
    anim: {
        animation: `$drop 10s 3s`,
    },
    checkMark: {
        marginLeft: theme.spacing(1),
    },
    buttonStyle: {
        color: theme.palette.common.white,
        svg: {
            fontSize: '1em',
        },
    },

    '@keyframes drop': {
        '0%': {
            opacity: '0%',
            top: '0%',
        },
        '10%': {
            opacity: '100%',
        },
        '100%': {
            top: '100%',
        },
    },
}));
