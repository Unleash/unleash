import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { Dialogue } from './Dialogue.tsx';
import { vi } from 'vitest';

test('modal should close when escape is pressed', () => {
    const mockSetOpen = vi.fn();
    render(
        <Dialogue
            open={true}
            setOpen={mockSetOpen}
            title={'New dialogue created'}
        />,
    );

    expect(screen.getByText('New dialogue created')).toBeInTheDocument();

    const dialogue = screen.getByRole('presentation');
    fireEvent.keyDown(dialogue, { key: 'Escape', code: 'Escape' });

    expect(mockSetOpen).toHaveBeenCalledWith(false);
});
