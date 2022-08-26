import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        display: 'flex',
        flexGrow: 1,
        alignItems: 'center',
        position: 'relative',
        backgroundColor: theme.palette.background.paper,
        maxWidth: '400px',
        [theme.breakpoints.down('md')]: {
            marginTop: theme.spacing(1),
            maxWidth: '100%',
        },
    },
    search: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.grey[500]}`,
        borderRadius: theme.shape.borderRadiusExtraLarge,
        padding: '3px 5px 3px 12px',
        width: '100%',
        zIndex: 3,
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
