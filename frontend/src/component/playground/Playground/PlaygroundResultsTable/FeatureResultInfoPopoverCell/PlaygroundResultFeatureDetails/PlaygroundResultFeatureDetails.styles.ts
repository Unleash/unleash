import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    titleRow: {
        display: 'inline-flex',
        alignItems: 'flex-start',
        justifyItems: 'center',
        gap: '12px',
    },
    descriptionRow: {
        flexDirection: 'row',
        display: 'inline-flex',
        alignItems: 'flex-start',
        justifyItems: 'center',
        gap: '6px',
    },
    name: {
        fontWeight: 600,
        padding: '4px',
    },
}));
