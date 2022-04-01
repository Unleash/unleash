import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    actionsContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    listParagraph: {
        textAlign: 'center',
    },
    searchBarContainer: {
        marginBottom: '2rem',
        display: 'flex',
        gap: '1rem',
        justifyContent: 'space-between',
        alignItems: 'center',
        [theme.breakpoints.down('xs')]: {
            display: 'block',
        },
    },
    searchBar: {
        minWidth: '450px',
        [theme.breakpoints.down('xs')]: {
            minWidth: '100%',
        },
    },
    emptyStateListItem: {
        // @ts-expect-error
        border: `2px dashed ${theme.palette.borders.main}`,
        padding: '0.8rem',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
}));
