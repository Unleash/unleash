import { useContext } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FlagProvider, { type IToggle } from '@unleash/proxy-client-react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { testUnleashClient } from 'utils/testUnleashClient';
import UIContext from 'contexts/UIContext';
import { SURVEY_KIND, SURVEY_VERSION } from 'component/feedbackModule/survey';
import { FeedbackProvider } from 'component/feedbackModule/delivery/FeedbackProvider';
import { FeedbackSurvey } from 'component/feedbackModule/delivery/FeedbackSurvey';
import { shouldShowSurvey } from 'component/feedbackModule/delivery/surveyStorage';
import { FeedbackNPS } from './FeedbackNPS.tsx';

const server = testServerSetup();

const PNPS_PROMPT = 'Hi. Do you have 2 minutes to help us improve Unleash?';

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
                submitBase: 'https://hosted.example.com/hosted',
            }),
        },
    },
});

const TriggerPNPS = () => {
    const { setShowFeedback } = useContext(UIContext);
    return (
        <button type='button' onClick={() => setShowFeedback(true)}>
            Trigger PNPS
        </button>
    );
};

const renderSurveys = (flags: IToggle[]) => {
    const client = testUnleashClient(flags);
    const view = render(
        <FlagProvider unleashClient={client} startClient={false}>
            <FeedbackProvider>
                <FeedbackSurvey />
            </FeedbackProvider>
            <FeedbackNPS openUrl='https://feedback.example.com' />
            <TriggerPNPS />
        </FlagProvider>,
    );
    return { client, ...view };
};

const triggerPNPS = () =>
    userEvent.click(screen.getByRole('button', { name: 'Trigger PNPS' }));

// PNPS only acts once the user's feedback history has loaded.
const triggerHeldBackPNPS = async () => {
    await triggerPNPS();
    await waitFor(() =>
        expect(shouldShowSurvey('never-shown-survey')).toBe(false),
    );
};

describe('FeedbackNPS', () => {
    beforeEach(() => {
        window.localStorage.clear();
        testServerRoute(server, '/api/admin/ui-config', {
            flags: { feedbackModuleDisplaySurvey: true },
        });
        testServerRoute(server, '/api/admin/user', {
            user: { id: 1, name: 'Test User', email: 'test@test.com' },
            permissions: [],
            feedback: [],
            splash: {},
        });
    });

    it('keeps feedback module surveys away once PNPS is shown', async () => {
        const { unmount } = renderSurveys([]);
        await triggerPNPS();
        expect(await screen.findByText(PNPS_PROMPT)).toBeInTheDocument();
        unmount();

        renderSurveys([surveyFlag('survey-a', 'Survey A')]);

        expect(screen.queryByText('Survey A')).not.toBeInTheDocument();
    });

    it('waits for the next trigger when a survey is already shown', async () => {
        renderSurveys([surveyFlag('survey-a', 'Survey A')]);
        await screen.findByText('Survey A');

        await triggerHeldBackPNPS();
        expect(screen.queryByText(PNPS_PROMPT)).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(screen.queryByText(PNPS_PROMPT)).not.toBeInTheDocument();

        await triggerPNPS();
        expect(await screen.findByText(PNPS_PROMPT)).toBeInTheDocument();
    });

    it('keeps feedback module surveys away after PNPS was held back', async () => {
        const { unmount } = renderSurveys([surveyFlag('survey-a', 'Survey A')]);
        await screen.findByText('Survey A');
        await triggerHeldBackPNPS();
        unmount();

        renderSurveys([surveyFlag('survey-b', 'Survey B')]);

        expect(screen.queryByText('Survey B')).not.toBeInTheDocument();
    });
});
