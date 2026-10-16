import { useState } from 'react';
import { expect, test } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { SelectPopover } from './SelectPopover.tsx';

const SegmentPicker = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [selected, setSelected] = useState<string[]>([]);

    return (
        <>
            <button
                type='button'
                onClick={(event) => setAnchorEl(event.currentTarget)}
            >
                Add segment
            </button>
            <output>{selected.join(', ')}</output>
            <SelectPopover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                options={[
                    {
                        value: 'enterprise',
                        label: 'Enterprise customers',
                        detail: '2 rules',
                    },
                    { value: 'pro', label: 'Pro customers', detail: '1 rule' },
                ]}
                multiple
                selected={selected}
                onChange={setSelected}
                searchPlaceholderText='Search segments'
            />
        </>
    );
};

test('selects rows by click and by Enter on the first search match, and closes on Done', async () => {
    render(<SegmentPicker />);

    fireEvent.click(screen.getByRole('button', { name: 'Add segment' }));
    fireEvent.click(
        await screen.findByRole('option', { name: 'Pro customers 1 rule' }),
    );
    expect(
        screen.getByRole('option', { name: 'Pro customers 1 rule' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('pro')).toBeInTheDocument();

    const search = screen.getByPlaceholderText('Search segments');
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription(
        'Esc to close',
    );
    fireEvent.change(search, { target: { value: 'enter' } });
    fireEvent.keyDown(search, { key: 'Enter' });
    expect(screen.getByText('pro, enterprise')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    await waitFor(() => {
        expect(
            screen.queryByPlaceholderText('Search segments'),
        ).not.toBeInTheDocument();
    });
});

const SingleFieldPicker = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [selected, setSelected] = useState('');

    return (
        <>
            <button
                type='button'
                onClick={(event) => setAnchorEl(event.currentTarget)}
            >
                Select field
            </button>
            <output>{selected}</output>
            <SelectPopover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                optionGroups={[
                    {
                        groupHeader: 'Project context fields',
                        options: [{ value: 'appName', label: 'appName' }],
                    },
                    {
                        groupHeader: 'Global context fields',
                        options: [{ value: 'userId', label: 'userId' }],
                    },
                ]}
                selected={selected ? [selected] : []}
                onChange={(newSelected) => setSelected(newSelected[0] ?? '')}
                searchPlaceholderText='Search context fields'
            />
        </>
    );
};

test('groups options by header, has no footer, and selects-and-closes when single-select', async () => {
    render(<SingleFieldPicker />);

    fireEvent.click(screen.getByRole('button', { name: 'Select field' }));
    expect(
        await screen.findByText('Project context fields'),
    ).toBeInTheDocument();
    expect(screen.getByText('Global context fields')).toBeInTheDocument();
    expect(
        screen.queryByRole('button', { name: 'Done' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: 'userId' }));

    expect(screen.getByRole('status')).toHaveTextContent('userId');
    await waitFor(() => {
        expect(
            screen.queryByPlaceholderText('Search context fields'),
        ).not.toBeInTheDocument();
    });
});
