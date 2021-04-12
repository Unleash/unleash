import { makeStyles } from '@material-ui/styles';

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
    },
    emptyStateListItem: {
        border: `2px dashed ${theme.palette.borders.main}`,
        padding: '0.8rem',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
}));
