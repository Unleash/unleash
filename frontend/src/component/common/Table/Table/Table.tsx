import { FC } from 'react';
import { Table as MUITable, TableProps } from '@mui/material';

export const Table: FC<
    TableProps & {
        rowHeight?: 'auto' | 'dense' | 'standard' | 'compact' | number;
    }
> = ({ rowHeight = 'auto', ...props }) => (
    <MUITable
        sx={{
            position: 'relative',
            '& tbody tr': {
                height: theme =>
                    ({
                        auto: 'auto',
                        standard: theme.shape.tableRowHeight,
                        compact: theme.shape.tableRowHeightCompact,
                        dense: theme.shape.tableRowHeightDense,
                    }[rowHeight] ?? rowHeight),
            },
        }}
        {...props}
    />
);
