import { vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { ChangeRequestRejectDialogue } from './ChangeRequestRejectDialog.tsx';

describe('<ChangeRequestRejectDialogue />', () => {
    test('submits the typed comment to onConfirm', () => {
        const handleConfirm = vi.fn();
        const handleClose = vi.fn();

        render(
            <ChangeRequestRejectDialogue
                open={true}
                onConfirm={handleConfirm}
                onClose={handleClose}
            />,
        );

        const commentInput = screen.getByPlaceholderText(
            'Add your comment here',
        );
        fireEvent.change(commentInput, { target: { value: 'Test Comment' } });

        const rejectButton = screen.getByRole('button', {
            name: /Reject changes/i,
        });
        fireEvent.click(rejectButton);

        expect(handleConfirm).toHaveBeenCalledWith('Test Comment');
    });
});
