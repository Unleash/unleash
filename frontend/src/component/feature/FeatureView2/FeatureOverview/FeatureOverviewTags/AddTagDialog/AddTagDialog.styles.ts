import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    dialogFormContent: {
        ['& > *']: {
            margin: '0.5rem 0',
        },
    },
}));
