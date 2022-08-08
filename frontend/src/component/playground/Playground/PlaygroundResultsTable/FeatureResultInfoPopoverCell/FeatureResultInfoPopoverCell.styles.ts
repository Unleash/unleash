import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    popoverPaper: {
        display: 'flex',
        flexDirection: 'column',
        // alignItems: 'flex-start',
        padding: theme.spacing(6),
        // maxWidth: '728px',
        width: 728,
        maxWidth: '100%',
        height: 'auto',
        overflowY: 'auto',
        backgroundColor: theme.palette.tertiary.light,
    },
}));
