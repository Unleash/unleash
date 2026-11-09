import { screen } from '@testing-library/react';
import {
    type ColumnDef,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { VirtualizedTable } from './VirtualizedTable.tsx';

const ROW_HEIGHT = 64;

type Item = { name: string };

const items: Item[] = Array.from({ length: 500 }, (_, index) => ({
    name: `row ${index}`,
}));

const columns: ColumnDef<Item, unknown>[] = [
    {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
        meta: { minWidth: 100 },
    },
];

const TableOf500Rows = () => {
    const tableInstance = useReactTable({
        columns,
        data: items,
        getCoreRowModel: getCoreRowModel(),
    });
    return (
        <VirtualizedTable
            tableInstance={tableInstance}
            rowHeight={ROW_HEIGHT}
        />
    );
};

// jsdom has no layout, so the table reports where its top edge is relative
// to the visible area through this stub; `rowCount` rows above means the
// user has scrolled that far into the table. Use multiples of the
// dampening step (5) so the index isn't rounded down.
const scrollTablePastByRows = (rowCount: number) => {
    const table = screen.getByRole('table');
    table.getBoundingClientRect = () =>
        ({ top: -rowCount * ROW_HEIGHT }) as DOMRect;
    window.dispatchEvent(new Event('scroll'));
};

test('shows only the rows around the visible part of the table', async () => {
    render(<TableOf500Rows />);

    // the table's top edge starts at the top of the visible area:
    // the first rows are shown, distant rows are not
    await screen.findByText('row 0');
    screen.getByText('row 40');
    expect(screen.queryByText('row 41')).toBeNull();

    // scrolled 100 rows into the table, e.g. past a header and another
    // table stacked above it
    scrollTablePastByRows(100);
    await screen.findByText('row 60');
    screen.getByText('row 140');
    expect(screen.queryByText('row 59')).toBeNull();
    expect(screen.queryByText('row 141')).toBeNull();

    // scrolled back up so far that the table's top edge is now 100 rows
    // below the visible area: keeps showing the top rows
    scrollTablePastByRows(-100);
    await screen.findByText('row 0');
    screen.getByText('row 40');
    expect(screen.queryByText('row 41')).toBeNull();
});
