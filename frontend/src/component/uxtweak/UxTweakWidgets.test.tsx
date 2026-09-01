import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FlagProvider from '@unleash/proxy-client-react';
import type { UnleashClient } from 'unleash-proxy-client';
import { render, settleProviders } from 'utils/testRenderer';
import { testUnleashClient } from 'utils/testUnleashClient';
import { UxTweakWidgets } from './UxTweakWidgets.tsx';

const ratingQuestion = {
    id: 'q1',
    type: 'rating',
    prompt: 'Rate this page',
    required: true,
};

const surveyFlag = (
    page: string,
    questions: object[] = [ratingQuestion],
    overrides: { name?: string; surveyId?: string; title?: string } = {},
) => ({
    name: overrides.name ?? 'uxtweak-survey-projects-abc1',
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
                surveyId: overrides.surveyId ?? 'sv_1',
                page,
                title: overrides.title ?? 'Quick feedback',
                intro: 'Two questions about this page.',
                questions,
                submitBase: 'https://uxtweak.example.com',
            }),
        },
    },
});

const GRACE_RAW_KEY = ':uxtweak-survey-grace:v1:localStorage:v2';

const seedRaw = (key: string, value: unknown, expiry?: number) =>
    localStorage.setItem(key, JSON.stringify({ value, expiry }));

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

    it('does not surface the next survey after the visitor concludes one', async () => {
        const flags = [
            surveyFlag('/projects'),
            surveyFlag('/projects', [ratingQuestion], {
                name: 'uxtweak-survey-projects-def2',
                surveyId: 'sv_2',
                title: 'Second survey',
            }),
        ];
        const first = renderWidgets(testUnleashClient(flags));
        await screen.findByText('Quick feedback');

        await userEvent.click(
            screen.getByRole('button', { name: 'Close survey' }),
        );
        expect(screen.queryByText('Second survey')).not.toBeInTheDocument();
        first.unmount();

        renderWidgets(testUnleashClient(flags));
        await settleProviders();
        expect(screen.queryByText('Quick feedback')).not.toBeInTheDocument();
        expect(screen.queryByText('Second survey')).not.toBeInTheDocument();
    });

    it('suppresses surveys during the grace period', async () => {
        seedRaw(GRACE_RAW_KEY, 'active');
        renderWidgets(testUnleashClient([surveyFlag('/projects')]));
        await settleProviders();
        expect(screen.queryByText('Quick feedback')).not.toBeInTheDocument();
    });

    it('shows surveys again once the grace period has passed', async () => {
        seedRaw(GRACE_RAW_KEY, 'active', Date.now() - 1);
        renderWidgets(testUnleashClient([surveyFlag('/projects')]));
        expect(await screen.findByText('Quick feedback')).toBeInTheDocument();
    });
});
