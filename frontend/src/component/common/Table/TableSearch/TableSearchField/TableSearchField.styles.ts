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
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.grey[300]}`,
        borderRadius: theme.shape.borderRadiusExtraLarge,
        padding: '3px 5px 3px 12px',
        maxWidth: '450px',
        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
        '&.search-container:focus-within': {
            borderColor: theme.palette.primary.light,
            boxShadow: theme.boxShadows.main,
        },
    },
    searchIcon: {
        marginRight: 8,
        color: theme.palette.inactiveIcon,
    },
    clearContainer: {
        width: '30px',
        '& > button': {
            padding: '7px',
        },
    },
    clearIcon: {
        color: theme.palette.grey[700],
        fontSize: '18px',
    },
    inputRoot: {
        width: '100%',
    },
}));
