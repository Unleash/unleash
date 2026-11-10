import { expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { http, HttpResponse } from 'msw';
import { FeedbackCESForm } from './FeedbackCESForm.tsx';
import { render } from 'utils/testRenderer';
import { testServerSetup } from 'utils/testServer';

const server = testServerSetup();
const state = {
    title: 'How easy was it to create a segment?',
    text: 'What could we improve?',
    path: '/segments',
} as const;

test('reveals the comment field after choosing a score', async () => {
    const user = userEvent.setup();

    render(
        <FeedbackCESForm
            state={state}
            onClose={() => {
                throw new Error('Unexpected onClose call.');
            }}
        />,
    );

    expect(screen.getByText(state.title)).toBeVisible();
    expect(screen.getAllByRole('radio')).toHaveLength(7);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(
        screen.queryByRole('button', { name: 'Send feedback' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: '5' }));

    expect(screen.getByRole('radio', { name: '5' })).toBeChecked();
    expect(screen.getByRole('textbox', { name: state.text })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Send feedback' })).toBeEnabled();
});

test('keeps the form open until feedback has been sent', async () => {
    const user = userEvent.setup();
    const requests: unknown[] = [];
    let finishRequest!: () => void;
    const responseReady = new Promise<void>((resolve) => {
        finishRequest = resolve;
    });
    server.use(
        http.post(
            'https://europe-west3-metrics-304612.cloudfunctions.net/docs-app-feedback',
            async ({ request }) => {
                requests.push(await request.json());
                await responseReady;
                return HttpResponse.json({});
            },
        ),
    );
    const Feedback = () => {
        const [open, setOpen] = useState(true);
        return open ? (
            <FeedbackCESForm state={state} onClose={() => setOpen(false)} />
        ) : null;
    };
    render(<Feedback />);

    await user.click(screen.getByRole('radio', { name: '5' }));
    await user.type(
        screen.getByRole('textbox', { name: state.text }),
        'The instructions were clear',
    );
    const submit = screen.getByRole('button', { name: 'Send feedback' });
    await user.click(submit);

    try {
        await waitFor(() =>
            expect(requests).toMatchObject([
                {
                    data: {
                        score: 5,
                        comment: 'The instructions were clear',
                        currentPage: '/segments',
                    },
                },
            ]),
        );
        expect(submit).toBeDisabled();
        expect(screen.getByText(state.title)).toBeVisible();
    } finally {
        finishRequest();
    }

    await waitFor(() =>
        expect(screen.queryByText(state.title)).not.toBeInTheDocument(),
    );
    expect(requests).toHaveLength(1);
});
