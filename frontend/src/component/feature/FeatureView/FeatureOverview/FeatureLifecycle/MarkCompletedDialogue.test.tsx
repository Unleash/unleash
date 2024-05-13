import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MarkCompletedDialogue } from './MarkCompletedDialogue';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const defaultProps = {
    isOpen: true,
    setIsOpen: vi.fn(),
    onComplete: vi.fn(),
    projectId: 'project1',
    featureId: 'feature1',
};

const server = testServerSetup();

const setup = (props = defaultProps) => {
    testServerRoute(
        server,
        `/api/admin/projects/${defaultProps.projectId}/features/${defaultProps.featureId}/parent-variants`,
        ['fard'],
    );

    render(<MarkCompletedDialogue {...props} />);
};

test('dialog opens correctly and can be closed', async () => {
    const { setIsOpen } = defaultProps;
    setup();

    expect(screen.getByText('Mark completed')).toBeInTheDocument();
    userEvent.click(screen.getByText('Cancel'));
    expect(setIsOpen).toHaveBeenCalledWith(false);
});

test('selecting options updates state appropriately', async () => {
    setup();

    const radioKept = screen.getByLabelText('We decided to keep the feature');
    userEvent.click(radioKept);
    expect(radioKept).toBeChecked();

    const radioDiscarded = screen.getByLabelText(
        'We decided to discard the feature',
    );
    userEvent.click(radioDiscarded);
    expect(radioDiscarded).toBeChecked();

    const radioVariant = screen.getByLabelText(
        'We decided to keep the feature variant',
    );
    userEvent.click(radioVariant);
    expect(radioVariant).toBeChecked();
});

test('variant selection is shown when appropriate', async () => {
    setup();

    userEvent.click(
        screen.getByLabelText('We decided to keep the feature variant'),
    );

    expect(
        screen.getByText(
            'Choose to specify which feature variant will be kept',
        ),
    ).toBeInTheDocument();
});
