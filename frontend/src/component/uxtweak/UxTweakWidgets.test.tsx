import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { ThemeProvider } from '@mui/material';
import FlagProvider from '@unleash/proxy-client-react';
import type { UnleashClient } from 'unleash-proxy-client';
import { lightTheme } from 'themes/theme';
import { testUnleashClient } from 'utils/testUnleashClient';
import { UxTweakWidgets } from './UxTweakWidgets.tsx';

const surveyFlag = (page: string) => ({
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
                questions: [
                    {
                        id: 'q1',
                        type: 'rating',
                        prompt: 'Rate this page',
                        required: true,
                    },
                ],
                submitBase: 'https://uxtweak.example.com',
            }),
        },
    },
});

const renderWidgets = (client: UnleashClient, route = '/projects') =>
    render(
        <ThemeProvider theme={lightTheme}>
            <MemoryRouter initialEntries={[route]}>
                <FlagProvider unleashClient={client} startClient={false}>
                    <UxTweakWidgets />
                </FlagProvider>
            </MemoryRouter>
        </ThemeProvider>,
    );

describe('UxTweakWidgets', () => {
    it('renders nothing when no uxtweak flags are enabled', () => {
        const { container } = renderWidgets(testUnleashClient([]));
        expect(container).toBeEmptyDOMElement();
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

    it('hides the card when the visitor closes it', async () => {
        renderWidgets(testUnleashClient([surveyFlag('/projects')]));
        await screen.findByText('Quick feedback');

        await userEvent.click(
            screen.getByRole('button', { name: 'Close survey' }),
        );
        expect(screen.queryByText('Quick feedback')).not.toBeInTheDocument();
    });
});
