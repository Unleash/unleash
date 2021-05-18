import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    emptyStateListItem: {
        border: `2px dashed ${theme.palette.borders.main}`,
        padding: '0.8rem',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
}));
