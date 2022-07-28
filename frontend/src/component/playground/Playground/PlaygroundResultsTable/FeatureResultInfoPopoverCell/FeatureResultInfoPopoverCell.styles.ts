import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    popoverPaper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '48px',
        gap: '24px',
        width: '728px',
        height: 'auto',
        // overflowY: 'scroll',
    },
}));
