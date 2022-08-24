import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    popoverPaper: {
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing(6),
        width: 728,
        maxWidth: '100%',
        height: 'auto',
        overflowY: 'auto',
        backgroundColor: theme.palette.tertiary.light,
        borderRadius: theme.shape.borderRadiusLarge,
    },
}));
