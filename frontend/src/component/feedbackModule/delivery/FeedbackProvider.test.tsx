import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FlagProvider from '@unleash/proxy-client-react';
import type { UnleashClient } from 'unleash-proxy-client';
import { http, HttpResponse } from 'msw';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { testUnleashClient } from 'utils/testUnleashClient';
import { SURVEY_VERSION } from '../survey.ts';
import type { SurveyTrigger } from '../triggers/surveyTrigger.ts';
import type { TriggerEvent } from '../triggers/triggerEvent.ts';
import type { TriggerObserver } from '../observers/observeTriggers.ts';
import type { IdentifyUser } from './identifyUser.ts';
import { SURVEY_SUBMIT_BASE, surveyFlag } from './testSurveyFlag.ts';

const server = testServerSetup();

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const DELAY_MS = 5000;

const runPendingSurveyTimers = () =>
    act(() => new Promise((resolve) => setTimeout(resolve, 0)));

const fakeTriggerObserver = (initialPath: string) => {
    let currentPath = initialPath;
    let installed: {
        triggers: SurveyTrigger[];
        onTrigger: (event: TriggerEvent) => void;
    } | null = null;
    const observe: TriggerObserver = (triggers, onTrigger) => {
        installed = { triggers, onTrigger };
        onTrigger({ on: 'page', path: currentPath });
        return () => {
            installed = null;
        };
    };
    const emit = (event: TriggerEvent) =>
        act(() => {
            if (event.on === 'page') {
                currentPath = event.path;
            }
            installed?.onTrigger(event);
        });
    return {
        observe,
        navigate: (path: string) => emit({ on: 'page', path }),
        click: (target: Element) =>
            emit({ on: 'click', path: currentPath, target }),
        isInstalled: () => installed !== null,
        installedTriggers: () => installed?.triggers ?? null,
    };
};

const dispatchEvent = (name: string) =>
    act(() => {
        document.dispatchEvent(new CustomEvent(name));
    });

let triggerObserver: ReturnType<typeof fakeTriggerObserver>;

const createFlagButton = (): Element => {
    const button = document.createElement('button');
    button.dataset.testid = 'create-flag';
    document.body.append(button);
    return button;
};

const CLICK_CREATE_FLAG: SurveyTrigger = {
    on: 'click',
    selector: '[data-testid="create-flag"]',
};

const APPEAR_FLAG_CREATED_TOAST: SurveyTrigger = {
    on: 'appear',
    selector: '[data-testid="toast"]',
};

const EVENT_FLAG_CREATED: SurveyTrigger = { on: 'event', name: 'flag-created' };
const EVENT_FLAG_ARCHIVED: SurveyTrigger = {
    on: 'event',
    name: 'flag-archived',
};

// Fresh modules, because surveyStorage remembers impressions per page load.
// Load the renderer after the reset too: otherwise its UIProvider would use
// the old UIContext while FeedbackSurvey uses the new one.
const loadPage = async () => {
    vi.resetModules();
    const { render } = await import('utils/testRenderer');
    const { FeedbackProvider } = await import('./FeedbackProvider.tsx');
    const { FeedbackSurvey } = await import('./FeedbackSurvey.tsx');

    return (
        client: UnleashClient,
        identifyUser: IdentifyUser = () => undefined,
    ) =>
        render(
            <FlagProvider unleashClient={client} startClient={false}>
                <FeedbackProvider
                    observeTriggers={triggerObserver.observe}
                    identifyUser={identifyUser}
                >
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
        `${SURVEY_SUBMIT_BASE}/feedback/features/survey-a/survey-responses`,
        null,
        'post',
        201,
    );

describe('FeedbackProvider', () => {
    beforeEach(async () => {
        window.localStorage.clear();
        triggerObserver = fakeTriggerObserver('/projects');
        renderSurvey = await loadPage();
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = '';
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
            await screen.findByRole('button', { name: 'Close' }),
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
        await runPendingSurveyTimers();

        expect(screen.queryByText('Survey A')).not.toBeInTheDocument();
    });

    it('sends the answers to the server as the identified user', async () => {
        const { requests } = surveyResponsesRoute();
        const client = testUnleashClient([surveyFlag('survey-a', 'Survey A')]);
        client.getContext = () => ({ appName: 'test', userId: '7' });
        renderSurvey(client, ({ userId }) => `user-${userId}`);

        await submitComment('Nice');

        await waitFor(() =>
            expect(requests).toEqual([
                {
                    surveyVersion: SURVEY_VERSION,
                    environmentId: 'production',
                    respondentId: 'user-7',
                    answers: { comment: 'Nice' },
                },
            ]),
        );
    });

    it('leaves out the respondent when the user cannot be identified', async () => {
        const { requests } = surveyResponsesRoute();
        renderSurvey(
            testUnleashClient([surveyFlag('survey-a', 'Survey A')]),
            () => undefined,
        );

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
                `${SURVEY_SUBMIT_BASE}/feedback/features/survey-a/survey-responses`,
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
        await runPendingSurveyTimers();

        expect(screen.queryByText('Survey A')).not.toBeInTheDocument();
    });

    it('thanks the user even when the answers cannot be sent', async () => {
        server.use(
            http.post(
                `${SURVEY_SUBMIT_BASE}/feedback/features/survey-a/survey-responses`,
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
            await screen.findByRole('button', { name: 'Close' }),
        );
        await runPendingSurveyTimers();

        expect(screen.queryByText('Survey A')).not.toBeInTheDocument();
        unmount();
        renderSurvey(client);
        await runPendingSurveyTimers();
        expect(screen.queryByText('Survey A')).not.toBeInTheDocument();
    });

    it('stops observing triggers on unmount', () => {
        const { unmount } = renderSurvey(testUnleashClient([]));
        expect(triggerObserver.isInstalled()).toBe(true);

        unmount();

        expect(triggerObserver.isInstalled()).toBe(false);
    });

    it('shows a page survey on the page it was opened on when the path matches', async () => {
        renderSurvey(
            testUnleashClient([
                surveyFlag('survey-a', 'Survey A', {
                    on: 'page',
                    path: '/projects',
                }),
            ]),
        );

        expect(await screen.findByText('Survey A')).toBeInTheDocument();
    });

    it('shows a page survey once the user navigates to a matching page', async () => {
        renderSurvey(
            testUnleashClient([
                surveyFlag('survey-a', 'Survey A', {
                    on: 'page',
                    path: '/projects/:projectId',
                }),
            ]),
        );
        expect(screen.queryByText('Survey A')).not.toBeInTheDocument();

        triggerObserver.navigate('/projects/default');

        expect(await screen.findByText('Survey A')).toBeInTheDocument();
    });

    it('shows a page survey whose flag arrives after the user reached the page', async () => {
        const client = testUnleashClient([]);
        renderSurvey(client);

        act(() =>
            client.setFlags([
                surveyFlag('survey-a', 'Survey A', {
                    on: 'page',
                    path: '/projects',
                }),
            ]),
        );

        expect(await screen.findByText('Survey A')).toBeInTheDocument();
    });

    it('shows the first survey by name among those matching the page', async () => {
        renderSurvey(
            testUnleashClient([
                surveyFlag('survey-c', 'Survey C', {
                    on: 'page',
                    path: '/projects',
                }),
                surveyFlag('survey-b', 'Survey B', {
                    on: 'page',
                    path: '/(projects|features)',
                }),
                surveyFlag('survey-a', 'Survey A', {
                    on: 'page',
                    path: '/features',
                }),
            ]),
        );

        expect(await screen.findByText('Survey B')).toBeInTheDocument();
        expect(screen.queryByText('Survey A')).not.toBeInTheDocument();
        expect(screen.queryByText('Survey C')).not.toBeInTheDocument();
    });

    it('keeps the shown survey when the user navigates away', async () => {
        renderSurvey(
            testUnleashClient([
                surveyFlag('survey-a', 'Survey A', {
                    on: 'page',
                    path: '/projects',
                }),
            ]),
        );
        await screen.findByText('Survey A');

        triggerObserver.navigate('/features');

        expect(screen.getByText('Survey A')).toBeInTheDocument();
    });

    it('does not show a dismissed page survey again on a later matching page', async () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        renderSurvey(
            testUnleashClient([
                surveyFlag('survey-a', 'Survey A', {
                    on: 'page',
                    path: '/projects/*',
                }),
                surveyFlag('survey-b', 'Survey B', {
                    on: 'page',
                    path: '/projects/other',
                }),
            ]),
        );
        triggerObserver.navigate('/projects/default');
        await userEvent.click(
            await screen.findByRole('button', { name: 'Close' }),
        );
        vi.setSystemTime(Date.now() + SEVEN_DAYS_MS + 1);

        triggerObserver.navigate('/projects/other');

        expect(await screen.findByText('Survey B')).toBeInTheDocument();
        expect(screen.queryByText('Survey A')).not.toBeInTheDocument();
    });

    it.each([
        { delay: 'no delay', delayMs: undefined },
        { delay: 'a zero delay', delayMs: 0 },
    ])('shows a click survey with $delay as soon as the user clicks a matching element', async ({
        delayMs,
    }) => {
        renderSurvey(
            testUnleashClient([
                surveyFlag('survey-a', 'Survey A', {
                    ...CLICK_CREATE_FLAG,
                    delayMs,
                }),
            ]),
        );

        expect(screen.queryByText('Survey A')).not.toBeInTheDocument();

        triggerObserver.click(createFlagButton());

        expect(await screen.findByText('Survey A')).toBeInTheDocument();
    });

    it('keeps the shown survey when the user clicks a matching element of another survey', async () => {
        renderSurvey(
            testUnleashClient([
                surveyFlag('survey-a', 'Survey A', CLICK_CREATE_FLAG),
                surveyFlag('survey-b', 'Survey B', { on: 'page' }),
            ]),
        );
        await screen.findByText('Survey B');

        triggerObserver.click(createFlagButton());
        await runPendingSurveyTimers();

        expect(screen.getByText('Survey B')).toBeInTheDocument();
        expect(screen.queryByText('Survey A')).not.toBeInTheDocument();
    });

    it('does not show a dismissed click survey again on a later click', async () => {
        renderSurvey(
            testUnleashClient([
                surveyFlag('survey-a', 'Survey A', CLICK_CREATE_FLAG),
            ]),
        );
        triggerObserver.click(createFlagButton());
        await userEvent.click(
            await screen.findByRole('button', { name: 'Close' }),
        );

        triggerObserver.click(createFlagButton());
        await runPendingSurveyTimers();

        expect(screen.queryByText('Survey A')).not.toBeInTheDocument();
    });

    it('hands the observer no triggers only while a survey is shown', async () => {
        renderSurvey(
            testUnleashClient([
                surveyFlag('survey-a', 'Survey A', APPEAR_FLAG_CREATED_TOAST),
                surveyFlag('survey-b', 'Survey B', { on: 'page' }),
            ]),
        );
        await screen.findByText('Survey B');
        expect(triggerObserver.isInstalled()).toBe(true);
        expect(triggerObserver.installedTriggers()).toEqual([]);

        await userEvent.click(screen.getByRole('button', { name: 'Close' }));

        expect(triggerObserver.installedTriggers()).toEqual([
            APPEAR_FLAG_CREATED_TOAST,
            { on: 'page' },
        ]);
    });

    it('observes the triggers of the surveys in the current flags', () => {
        const client = testUnleashClient([
            surveyFlag('survey-a', 'Survey A', CLICK_CREATE_FLAG),
        ]);
        renderSurvey(client);
        expect(triggerObserver.installedTriggers()).toEqual([
            CLICK_CREATE_FLAG,
        ]);

        act(() =>
            client.setFlags([
                surveyFlag('survey-a', 'Survey A', APPEAR_FLAG_CREATED_TOAST),
            ]),
        );

        expect(triggerObserver.installedTriggers()).toEqual([
            APPEAR_FLAG_CREATED_TOAST,
        ]);

        act(() => client.setFlags([]));

        expect(triggerObserver.installedTriggers()).toEqual([]);
    });

    it('shows an event survey only once the host app dispatches its event', async () => {
        renderSurvey(
            testUnleashClient([
                surveyFlag('survey-a', 'Survey A', EVENT_FLAG_CREATED),
            ]),
        );
        expect(screen.queryByText('Survey A')).not.toBeInTheDocument();

        dispatchEvent('flag-created');

        expect(await screen.findByText('Survey A')).toBeInTheDocument();
    });

    it('matches an event against the page the user is currently on', async () => {
        renderSurvey(
            testUnleashClient([
                surveyFlag('survey-a', 'Survey A', {
                    ...EVENT_FLAG_CREATED,
                    path: '/projects/:projectId',
                }),
            ]),
        );
        dispatchEvent('flag-created');
        await runPendingSurveyTimers();
        expect(screen.queryByText('Survey A')).not.toBeInTheDocument();

        triggerObserver.navigate('/projects/default');
        dispatchEvent('flag-created');

        expect(await screen.findByText('Survey A')).toBeInTheDocument();
    });

    it('observes the events of surveys that arrive after the first render', async () => {
        const client = testUnleashClient([
            surveyFlag('survey-a', 'Survey A', CLICK_CREATE_FLAG),
        ]);
        renderSurvey(client);

        act(() =>
            client.setFlags([
                surveyFlag('survey-c', 'Survey C', EVENT_FLAG_CREATED),
                surveyFlag('survey-b', 'Survey B', EVENT_FLAG_ARCHIVED),
                surveyFlag('survey-a', 'Survey A', EVENT_FLAG_CREATED),
            ]),
        );
        dispatchEvent('flag-archived');

        expect(await screen.findByText('Survey B')).toBeInTheDocument();
    });

    describe('delayed surveys', () => {
        beforeEach(() => {
            vi.useFakeTimers({
                toFake: ['setTimeout', 'clearTimeout', 'Date'],
            });
        });

        it('shows a click survey only once its delay has passed since the click', () => {
            renderSurvey(
                testUnleashClient([
                    surveyFlag('survey-a', 'Survey A', {
                        ...CLICK_CREATE_FLAG,
                        delayMs: DELAY_MS,
                    }),
                ]),
            );

            triggerObserver.click(createFlagButton());
            act(() => vi.advanceTimersByTime(DELAY_MS - 1));

            expect(screen.queryByText('Survey A')).not.toBeInTheDocument();

            act(() => vi.advanceTimersByTime(1));

            expect(screen.getByText('Survey A')).toBeInTheDocument();
        });

        it('shows a delayed page survey even when the user has left the page', () => {
            renderSurvey(
                testUnleashClient([
                    surveyFlag('survey-a', 'Survey A', {
                        on: 'page',
                        path: '/projects',
                        delayMs: DELAY_MS,
                    }),
                ]),
            );

            triggerObserver.navigate('/features');
            act(() => vi.advanceTimersByTime(DELAY_MS));

            expect(screen.getByText('Survey A')).toBeInTheDocument();
        });

        it('lets a later trigger take over from a delayed survey', () => {
            renderSurvey(
                testUnleashClient([
                    surveyFlag('survey-a', 'Survey A', {
                        on: 'page',
                        delayMs: DELAY_MS,
                    }),
                    surveyFlag('survey-b', 'Survey B', CLICK_CREATE_FLAG),
                ]),
            );

            triggerObserver.click(createFlagButton());
            act(() => vi.advanceTimersByTime(0));

            expect(screen.getByText('Survey B')).toBeInTheDocument();

            act(() => vi.advanceTimersByTime(DELAY_MS));

            expect(screen.getByText('Survey B')).toBeInTheDocument();
            expect(screen.queryByText('Survey A')).not.toBeInTheDocument();
        });
    });
});
