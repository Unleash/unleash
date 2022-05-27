import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
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
        [theme.breakpoints.down('sm')]: {
            display: 'block',
        },
        '&.dense': {
            marginBottom: '1rem',
        },
    },
    searchBar: {
        minWidth: '450px',
        [theme.breakpoints.down('sm')]: {
            minWidth: '100%',
        },
    },
    emptyStateListItem: {
        border: `2px dashed ${theme.palette.grey[100]}`,
        padding: '0.8rem',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    row: {
        position: 'absolute',
        width: '100%',
    },
    cell: {
        alignItems: 'center',
        display: 'flex',
        flexShrink: 0,
        '& > *': {
            flexGrow: 1,
        },
    },
}));
