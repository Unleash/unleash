import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles({
    listItem: {
        padding: 0,
        ['& a']: {
            textDecoration: 'none',
            color: 'inherit',
        },
    },
});
