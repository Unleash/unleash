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
    summary: {
        width: 'auto',
        height: 'auto',
        padding: theme.spacing(2, 3),
        borderRadius: theme.shape.borderRadiusMedium,
        border: `1px solid ${theme.palette.dividerAlternative}`,
    },
}));
