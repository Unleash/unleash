import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        listStyleType: 'none',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        padding: 0,
        margin: 0,
        marginBottom: '1rem !important',
    },
}));
