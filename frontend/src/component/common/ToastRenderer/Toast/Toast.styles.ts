import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
    container: {
        maxWidth: '450px',
        background: theme.palette.background.paper, // todo: add new background colors here
        boxShadow: theme.boxShadows.popup,
        zIndex: 500,
        margin: '0 0.8rem',
        borderRadius: theme.shape.borderRadiusMedium,
        padding: theme.spacing(1),
        paddingInlineStart: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        gap: theme.spacing(1),
    },
    starting: {
        opacity: 0,
    },
    headerStyles: {
        fontSize: theme.typography.body1.fontSize,
        fontWeight: 'normal',
        margin: 0,
    },
    anim: {
        animation: `$drop 10s 3s`,
    },
    checkMark: {
        marginInlineStart: theme.spacing(1),
    },
    buttonStyle: {
        color: theme.palette.text.primary, // set icon color here
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
