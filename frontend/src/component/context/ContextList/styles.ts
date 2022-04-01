import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles({
    listItem: {
        padding: 0,
        '& a': {
            textDecoration: 'none',
            color: 'inherit',
        },
    },
});
