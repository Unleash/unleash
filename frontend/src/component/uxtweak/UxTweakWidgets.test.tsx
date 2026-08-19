import { beforeEach, describe, expect, it } from 'vitest';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FlagProvider from '@unleash/proxy-client-react';
import type { UnleashClient } from 'unleash-proxy-client';
import { render } from 'utils/testRenderer';
import { testUnleashClient } from 'utils/testUnleashClient';
import { UxTweakWidgets } from './UxTweakWidgets.tsx';

const ratingQuestion = {
    id: 'q1',
    type: 'rating',
    prompt: 'Rate this page',
    required: true,
};

const surveyFlag = (page: string, questions: object[] = [ratingQuestion]) => ({
    name: 'uxtweak-survey-projects-abc1',
    enabled: true,
    impressionData: false,
    variant: {
        name: 'config',
        enabled: true,
        feature_enabled: true,
        payload: {
            type: 'json',
            value: JSON.stringify({
                v: 1,
                surveyId: 'sv_1',
                page,
                title: 'Quick feedback',
                intro: 'Two questions about this page.',
                questions,
                submitBase: 'https://uxtweak.example.com',
            }),
        },
    },
});

// The shared renderer's wrapper starts async provider work on mount (SWR
// fetches, SDK ready/update events). Positive tests settle it implicitly via
// findBy*, but the nothing-is-rendered tests have nothing to await, so this
// flush runs first: it keeps those late updates inside act() and ensures the
// absence assertions run after anything that could still have rendered the
// card — proving suppression rather than winning a race.
const settleProviders = () => act(async () => {});

const renderWidgets = (client: UnleashClient, route = '/projects') =>
    render(
        <FlagProvider unleashClient={client} startClient={false}>
            <UxTweakWidgets />
        </FlagProvider>,
        { route },
    );

describe('UxTweakWidgets', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders nothing when no uxtweak flags are enabled', async () => {
        renderWidgets(testUnleashClient([]));
        await settleProviders();
        expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });

    it('shows the survey card when a valid survey flag matches the page', async () => {
        renderWidgets(testUnleashClient([surveyFlag('/projects')]));
        expect(await screen.findByText('Quick feedback')).toBeInTheDocument();
        expect(
            screen.getByText('Two questions about this page.'),
        ).toBeInTheDocument();
    });

    it('shows the card when the flag arrives after mount via an update event', async () => {
        const client = testUnleashClient([]);
        renderWidgets(client);
        expect(screen.queryByText('Quick feedback')).not.toBeInTheDocument();

        client.setFlags([surveyFlag('/projects')]);
        expect(await screen.findByText('Quick feedback')).toBeInTheDocument();
    });

    it('lets the visitor answer every question type and submit once required ones are answered', async () => {
        renderWidgets(
            testUnleashClient([
                surveyFlag('/projects', [
                    ratingQuestion,
                    {
                        id: 'q2',
                        type: 'single',
                        options: ['Daily', 'Weekly'],
                        prompt: 'How often do you visit?',
                        required: true,
                    },
                    {
                        id: 'q3',
                        type: 'text',
                        prompt: 'Anything else?',
                        required: false,
                    },
                ]),
            ]),
        );
        await screen.findByText('Quick feedback');

        const submit = screen.getByRole('button', { name: 'Submit' });
        expect(submit).toBeDisabled();

        await userEvent.click(screen.getByRole('radio', { name: '4 Stars' }));
        expect(submit).toBeDisabled();

        await userEvent.click(screen.getByRole('radio', { name: 'Weekly' }));
        expect(submit).toBeEnabled();

        await userEvent.type(
            screen.getByLabelText('Anything else?'),
            'More flags please',
        );
        await userEvent.click(submit);

        expect(
            screen.getByText('Thanks for your feedback!'),
        ).toBeInTheDocument();
        expect(screen.queryByText('Rate this page')).not.toBeInTheDocument();

        await userEvent.click(
            screen.getByRole('button', { name: 'Close survey' }),
        );
        expect(screen.queryByText('Quick feedback')).not.toBeInTheDocument();
    });

    it('never shows a survey again after the visitor submits it', async () => {
        const first = renderWidgets(
            testUnleashClient([surveyFlag('/projects')]),
        );
        await screen.findByText('Quick feedback');

        await userEvent.click(screen.getByRole('radio', { name: '4 Stars' }));
        await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
        expect(
            screen.getByText('Thanks for your feedback!'),
        ).toBeInTheDocument();

        first.unmount();
        renderWidgets(testUnleashClient([surveyFlag('/projects')]));
        await settleProviders();
        expect(screen.queryByText('Quick feedback')).not.toBeInTheDocument();
    });

    it('ignores malformed seen-survey storage instead of crashing', async () => {
        localStorage.setItem(
            ':uxtweak-surveys-seen:v1:localStorage:v2',
            JSON.stringify({ value: { not: 'an array' } }),
        );
        renderWidgets(testUnleashClient([surveyFlag('/projects')]));
        expect(await screen.findByText('Quick feedback')).toBeInTheDocument();
    });

    it('never shows a survey again after the visitor closes it', async () => {
        const first = renderWidgets(
            testUnleashClient([surveyFlag('/projects')]),
        );
        await screen.findByText('Quick feedback');
        await userEvent.click(
            screen.getByRole('button', { name: 'Close survey' }),
        );
        expect(screen.queryByText('Quick feedback')).not.toBeInTheDocument();
        first.unmount();

        renderWidgets(testUnleashClient([surveyFlag('/projects')]));
        await settleProviders();
        expect(screen.queryByText('Quick feedback')).not.toBeInTheDocument();
    });
});
