import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    popoverPaper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: theme.spacing(6),
        width: '728px',
        height: 'auto',
        overflowY: 'scroll',
        backgroundColor: theme.palette.tertiary.light,
    },
}));
