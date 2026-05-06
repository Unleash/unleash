import '@tanstack/react-table';
import type { RowData } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
    interface ColumnMeta<_TData extends RowData, _TValue> {
        align?: 'left' | 'center' | 'right';
        width?: number | string;
    }
}
