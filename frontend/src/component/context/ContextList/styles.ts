import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()({
    listItem: {
        padding: 0,
        '& a': {
            textDecoration: 'none',
            color: 'inherit',
        },
    },
});
