import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    strategiesContainer: {
        padding: '0.25rem 0',
        ['& > *']: {
            margin: '0.5rem 0',
        },
    },
}));
