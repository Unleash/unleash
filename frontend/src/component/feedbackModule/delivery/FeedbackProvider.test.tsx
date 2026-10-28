import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FlagProvider, { type IToggle } from '@unleash/proxy-client-react';
import type { UnleashClient } from 'unleash-proxy-client';
import { render } from 'utils/testRenderer';
import { http, HttpResponse } from 'msw';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { testUnleashClient } from 'utils/testUnleashClient';
import { SURVEY_KIND, SURVEY_VERSION } from '../survey.ts';

const server = testServerSetup();

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const SUBMIT_BASE = 'https://hosted.example.com/hosted';

const surveyFlag = (name: string, title: string): IToggle => ({
    name,
    enabled: true,
    impressionData: false,
    variant: {
        name: 'survey',
        enabled: true,
        feature_enabled: true,
        payload: {
            type: 'json',
            value: JSON.stringify({
                kind: SURVEY_KIND,
                version: SURVEY_VERSION,
                environmentId: 'production',
                title,
                questions: [
                    { id: 'comment', type: 'free-text', prompt: 'Comment' },
                ],
                submitBase: SUBMIT_BASE,
            }),
        },
    },
});

// Fresh modules, because surveyStorage remembers impressions per page load.
const loadPage = async () => {
    vi.resetModules();
    const { FeedbackProvider } = await import('./FeedbackProvider.tsx');
    const { FeedbackSurvey } = await import('./FeedbackSurvey.tsx');

    return (client: UnleashClient) =>
        render(
            <FlagProvider unleashClient={client} startClient={false}>
                <FeedbackProvider>
                    <FeedbackSurvey />
                </FeedbackProvider>
            </FlagProvider>,
        );
};

let renderSurvey: Awaited<ReturnType<typeof loadPage>>;

const submitComment = async (comment: string) => {
    await userEvent.click(
        await screen.findByRole('button', { name: 'Share feedback' }),
    );
    await userEvent.type(
        screen.getByRole('textbox', { name: 'Comment' }),
        comment,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
};

const surveyResponsesRoute = () =>
    testServerRoute(
        server,
        `${SUBMIT_BASE}/feedback/features/survey-a/survey-responses`,
        null,
        'post',
        201,
    );

describe('FeedbackProvider', () => {
    beforeEach(async () => {
        window.localStorage.clear();
        renderSurvey = await loadPage();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('shows the first survey by name that has not been interacted with', async () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        const client = testUnleashClient([
            surveyFlag('survey-c', 'Survey C'),
            surveyFlag('not-a-survey', 'Not a survey'),
            surveyFlag('survey-b', 'Survey B'),
            surveyFlag('survey-a', 'Survey A'),
        ]);
        const { unmount } = renderSurvey(client);
        await userEvent.click(
            await screen.findByRole('button', { name: 'Close survey' }),
        );
        unmount();
        vi.setSystemTime(Date.now() + SEVEN_DAYS_MS + 1);

        renderSurvey = await loadPage();
        renderSurvey(client);

        expect(await screen.findByText('Survey B')).toBeInTheDocument();
        expect(screen.queryByText('Survey A')).not.toBeInTheDocument();
        expect(screen.queryByText('Not a survey')).not.toBeInTheDocument();
    });

    it('keeps the shown survey when flags refresh', async () => {
        const client = testUnleashClient([surveyFlag('survey-b', 'Survey B')]);
        renderSurvey(client);
        await screen.findByText('Survey B');

        act(() => client.setFlags([surveyFlag('survey-a', 'Survey A')]));

        expect(screen.getByText('Survey B')).toBeInTheDocument();
    });

    it('stops showing a survey after 3 page loads', async () => {
        const client = testUnleashClient([surveyFlag('survey-a', 'Survey A')]);
        for (let pageLoad = 1; pageLoad <= 3; pageLoad++) {
            const { unmount } = renderSurvey(client);
            await screen.findByText('Survey A');
            unmount();
            renderSurvey = await loadPage();
        }

        renderSurvey(client);

        expect(screen.queryByText('Survey A')).not.toBeInTheDocument();
    });

    it('sends the answers to the server', async () => {
        const { requests } = surveyResponsesRoute();
        renderSurvey(testUnleashClient([surveyFlag('survey-a', 'Survey A')]));

        await submitComment('Nice');

        await waitFor(() =>
            expect(requests).toEqual([
                {
                    surveyVersion: SURVEY_VERSION,
                    environmentId: 'production',
                    respondentId: 'test-session',
                    answers: { comment: 'Nice' },
                },
            ]),
        );
    });

    it('leaves out the respondent when the session is not known yet', async () => {
        const { requests } = surveyResponsesRoute();
        const client = testUnleashClient([surveyFlag('survey-a', 'Survey A')]);
        client.getContext = () => ({ appName: 'test' });
        renderSurvey(client);

        await submitComment('Nice');

        await waitFor(() =>
            expect(requests).toEqual([
                {
                    surveyVersion: SURVEY_VERSION,
                    environmentId: 'production',
                    answers: { comment: 'Nice' },
                },
            ]),
        );
    });

    it('sends the answers without the session of the current instance', async () => {
        const credentials: RequestCredentials[] = [];
        server.use(
            http.post(
                `${SUBMIT_BASE}/feedback/features/survey-a/survey-responses`,
                ({ request }) => {
                    credentials.push(request.credentials);
                    return new HttpResponse(null, { status: 201 });
                },
            ),
        );
        renderSurvey(testUnleashClient([surveyFlag('survey-a', 'Survey A')]));

        await submitComment('Nice');

        await waitFor(() => expect(credentials).toEqual(['omit']));
    });

    it('does not show the survey again once submitted', async () => {
        surveyResponsesRoute();
        const client = testUnleashClient([surveyFlag('survey-a', 'Survey A')]);
        const { unmount } = renderSurvey(client);
        await submitComment('Nice');

        unmount();
        renderSurvey(client);

        expect(screen.queryByText('Survey A')).not.toBeInTheDocument();
    });

    it('thanks the user even when the answers cannot be sent', async () => {
        server.use(
            http.post(
                `${SUBMIT_BASE}/feedback/features/survey-a/survey-responses`,
                () => HttpResponse.error(),
            ),
        );
        renderSurvey(testUnleashClient([surveyFlag('survey-a', 'Survey A')]));

        await submitComment('Nice');

        expect(
            await screen.findByText('Thanks for your feedback!'),
        ).toBeInTheDocument();
    });

    it('hides the card for good when dismissed', async () => {
        const client = testUnleashClient([surveyFlag('survey-a', 'Survey A')]);
        const { unmount } = renderSurvey(client);

        await userEvent.click(
            await screen.findByRole('button', { name: 'Close survey' }),
        );

        expect(screen.queryByText('Survey A')).not.toBeInTheDocument();
        unmount();
        renderSurvey(client);
        expect(screen.queryByText('Survey A')).not.toBeInTheDocument();
    });
});
