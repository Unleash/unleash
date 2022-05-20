import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    search: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: theme.palette.background.default,
        borderRadius: theme.shape.borderRadiusExtraLarge,
        padding: '0.25rem 0.5rem',
        maxWidth: '450px',
        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
    },
    searchIcon: {
        marginRight: 8,
        color: theme.palette.inactiveIcon,
    },
    inputRoot: {
        width: '100%',
    },
}));
