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
        maxWidth: '270px',
        marginTop: '0.25rem',
        fontSize: theme.fontSizes.smallBody,
        textAlign: 'right',
        [theme.breakpoints.down(700)]: {
            display: 'none',
        },
    },
    percentage: {
        color: theme.palette.primary.main,
        textAlign: 'right',
        fontSize: theme.fontSizes.bodySize,
    },
    percentageCircle: {
        margin: '0 1rem',
        [theme.breakpoints.down(500)]: {
            display: 'none',
        },
    },
}));
