import '@tanstack/react-table';

declare module '@tanstack/table-core' {
    interface ColumnMeta<TData extends RowData, TValue> {
        align?: 'left' | 'center' | 'right';
        width?: number | string;
    }
}
