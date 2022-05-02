import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    valueContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '1ch',
    },
    valueSeparator: {
        color: theme.palette.grey[700],
    },
}));
