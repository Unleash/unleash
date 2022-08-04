import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    valueContainer: {
        padding: theme.spacing(2, 3),
        border: `1px solid ${theme.palette.dividerAlternative}`,
        borderRadius: theme.shape.borderRadiusMedium,
    },
    valueSeparator: {
        color: theme.palette.grey[700],
    },
}));
