import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    link: {
        position: 'fixed',
        overflow: 'hidden',
        zIndex: 1000,
        top: '1.125rem',
        left: '1.125rem',
        padding: '0.5rem 1rem',
        whiteSpace: 'nowrap',
        textDecoration: 'none',
        background: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
        borderRadius: theme.borders.radius.main,
        fontSize: theme.fontSizes.smallBody,

        [theme.breakpoints.down(960)]: {
            top: '0.8rem',
            left: '0.8rem',
        },

        '&:not(:focus):not(:active)': {
            clip: 'rect(0 0 0 0)',
            clipPath: 'inset(50%)',
            zIndex: -1,
            width: 1,
            height: 1,
            margin: -1,
            padding: 0,
        },
    },
}));
