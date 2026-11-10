import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FeedbackComponent } from './FeedbackComponent.tsx';
import type { FeedbackData } from './FeedbackContext.ts';

const FEEDBACK_PATH = '/api/feedback';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        feedbackUriPath: FEEDBACK_PATH,
    });
};

const defaultFeedbackData: FeedbackData = {
    category: 'general',
    title: 'How easy was it to create a strategy?',
    positiveLabel: 'What worked well?',
    areasForImprovementsLabel: 'What could be improved?',
};

const renderFeedback = (overrides: Partial<FeedbackData> = {}) =>
    render(
        <FeedbackComponent
            feedbackData={{ ...defaultFeedbackData, ...overrides }}
            showFeedback={true}
            closeFeedback={() => {}}
            feedbackMode='manual'
        />,
    );

test('submit is disabled until a rating is selected', async () => {
    setupApi();
    renderFeedback();

    const submit = await screen.findByRole('button', { name: 'Send Feedback' });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByLabelText('3 Stars'));

    expect(submit).toBeEnabled();
});

test('submits the selected score and comments to the feedback endpoint', async () => {
    setupApi();
    const { requests } = testServerRoute(server, FEEDBACK_PATH, {}, 'post');

    renderFeedback();

    fireEvent.click(await screen.findByLabelText('4 Stars'));
    const [positive, areasForImprovement] =
        screen.getAllByPlaceholderText('Your answer here');
    fireEvent.change(positive, { target: { value: 'great onboarding' } });
    fireEvent.change(areasForImprovement, {
        target: { value: 'docs could be clearer' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Send Feedback' }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0]).toEqual({
        category: 'general',
        userType: 'oss',
        difficultyScore: 4,
        positive: 'great onboarding',
        areasForImprovement: 'docs could be clearer',
    });
});

test('clearing the rating re-disables the submit button', async () => {
    setupApi();
    renderFeedback();

    const star = await screen.findByLabelText('2 Stars');
    fireEvent.click(star, { clientX: 1, clientY: 1 });

    const submit = screen.getByRole('button', { name: 'Send Feedback' });
    expect(submit).toBeEnabled();

    fireEvent.click(star, { clientX: 1, clientY: 1 });

    expect(submit).toBeDisabled();
});
