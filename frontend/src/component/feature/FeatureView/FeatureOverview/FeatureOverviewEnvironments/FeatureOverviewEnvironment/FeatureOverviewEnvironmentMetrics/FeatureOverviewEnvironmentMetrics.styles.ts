import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
    },
    info: {
        marginRight: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
    },
    icon: {
        fill: theme.palette.grey[300],
        height: '75px',
        width: '75px',
        [theme.breakpoints.down(500)]: {
            display: 'none',
        },
    },
    infoParagraph: {
        maxWidth: '215px',
        marginTop: '0.25rem',
        fontSize: theme.fontSizes.smallBody,
        [theme.breakpoints.down(700)]: {
            display: 'none',
        },
    },
    percentage: {
        color: theme.palette.primary.light,
        textAlign: 'right',
        fontSize: theme.fontSizes.subHeader,
    },
    percentageCircle: {
        transform: 'scale(0.85)',
        [theme.breakpoints.down(500)]: {
            display: 'none',
        },
    },
}));
