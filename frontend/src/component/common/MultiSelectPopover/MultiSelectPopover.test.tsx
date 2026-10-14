import { useState } from 'react';
import { expect, test } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { MultiSelectPopover } from './MultiSelectPopover.tsx';

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
            <MultiSelectPopover
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
