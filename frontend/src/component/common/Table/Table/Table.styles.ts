import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles<{
    rowHeight: 'auto' | 'standard' | 'dense' | 'compact' | number;
}>()((theme, { rowHeight }) => ({
    table: {
        '& tbody tr': {
            height:
                {
                    auto: 'auto',
                    standard: theme.shape.tableRowHeight,
                    compact: theme.shape.tableRowHeightCompact,
                    dense: theme.shape.tableRowHeightDense,
                }[rowHeight] ?? rowHeight,
        },
    },
}));
