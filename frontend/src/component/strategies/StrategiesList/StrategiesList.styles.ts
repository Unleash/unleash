import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    listItem: {
        padding: '0',
        ['& a']: {
            textDecoration: 'none',
            color: 'inherit',
        },
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
        },
    },
}));
