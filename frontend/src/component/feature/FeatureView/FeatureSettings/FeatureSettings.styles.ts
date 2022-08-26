import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    innerContainer: {
        display: 'flex',
    },
    bodyContainer: {
        padding: 0,
    },
    listContainer: {
        width: '20%',
        borderRight: `1px solid ${theme.palette.grey[300]}`,
        padding: '1rem 0',
        [theme.breakpoints.down('md')]: {
            width: '35%',
        },
    },
    listItem: {
        padding: '0.75rem 2rem',
    },
    innerBodyContainer: {
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        width: 400,
        ['& > *']: {
            margin: '0.5rem 0',
        },
    },
}));
