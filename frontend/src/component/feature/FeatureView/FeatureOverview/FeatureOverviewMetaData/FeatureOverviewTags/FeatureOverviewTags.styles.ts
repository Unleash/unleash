import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        borderRadius: theme.shape.borderRadiusLarge,
        backgroundColor: theme.palette.primary.main,
        display: 'flex',
        flexDirection: 'column',
        marginRight: '1rem',
        marginTop: '1rem',
        [theme.breakpoints.down(800)]: {
            width: '100%',
            maxWidth: 'none',
        },
    },
    tagHeader: {
        display: 'flex',
        alignItems: 'center',
    },
    tag: {
        height: '40px',
        width: '40px',
        fill: theme.palette.primary.main,
        marginRight: '0.8rem',
    },
    tagChip: {
        marginRight: '0.25rem',
        marginTop: '0.5rem',
        backgroundColor: '#fff',
        fontSize: theme.fontSizes.smallBody,
    },
    closeIcon: {
        color: theme.palette.primary.light,
        '&:hover': {
            color: theme.palette.primary.light,
        },
    },
}));
