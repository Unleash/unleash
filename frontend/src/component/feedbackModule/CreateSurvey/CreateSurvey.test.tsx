import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useParams } from 'react-router';
import ToastRenderer from 'component/common/ToastRenderer/ToastRenderer';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import type { IPermission } from 'interfaces/user';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { CreateSurvey } from './CreateSurvey.tsx';

const server = testServerSetup();

// scrollIntoView is not implemented in jsdom
HTMLElement.prototype.scrollIntoView = () => {};

const flagName = 'survey-onboarding';
const featuresPath = (projectId: string) =>
    `/api/admin/projects/${projectId}/features`;
const flagPath = (projectId: string) =>
    `${featuresPath(projectId)}/${flagName}`;

const setupApi = ({
    projectId = 'default',
    tagStatus = 200,
    strategyStatus = 200,
} = {}) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { feedbackModule: true },
        unleashUrl: 'https://hosted.example.com/hosted',
    });
    testServerRoute(server, '/api/admin/projects', {
        projects: [
            { id: 'default', name: 'Default' },
            { id: 'marketing', name: 'Marketing' },
        ],
    });
    const createFlag = testServerRoute(
        server,
        featuresPath(projectId),
        {},
        'post',
    );
    testServerRoute(
        server,
        '/api/admin/tag-types/role',
        { name: 'role' },
        'get',
        tagStatus,
    );
    testServerRoute(server, `/api/admin/features/${flagName}/tags`, {}, 'put');
    testServerRoute(server, flagPath(projectId), {
        environments: [{ name: 'development' }],
    });
    const addStrategy = testServerRoute(
        server,
        `${flagPath(projectId)}/environments/development/strategies`,
        {},
        'post',
        strategyStatus,
    );
    return { createFlag, addStrategy };
};

const FlagPage = () => {
    const { projectId, featureId } = useParams();
    return <p>{`Flag page for ${projectId}/${featureId}`}</p>;
};

const renderPage = (
    permissions: IPermission[] = [{ permission: CREATE_FEATURE }],
) =>
    render(
        <>
            <ToastRenderer />
            <Routes>
                <Route path='/surveys/create' element={<CreateSurvey />} />
                <Route
                    path='/projects/:projectId/features/:featureId'
                    element={<FlagPage />}
                />
            </Routes>
        </>,
        { route: '/surveys/create', permissions },
    );

const questionCard = (number: number) =>
    screen.getByRole('group', { name: `Question ${number}` });

const sentSurvey = (addStrategy: { requests: unknown[] }) => {
    const [strategy] = addStrategy.requests as {
        variants: { payload: { value: string } }[];
    }[];
    return JSON.parse(strategy.variants[0].payload.value);
};

const clickNext = async () => {
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }));
};

const goToTrigger = async () => {
    await clickNext();
    await screen.findByRole('heading', { name: 'When to show the survey' });
};

const goToSettings = async () => {
    await goToTrigger();
    await clickNext();
};

const submitSurvey = async () => {
    await userEvent.type(
        await screen.findByLabelText('Flag name'),
        'onboarding',
    );
    await userEvent.click(
        screen.getByRole('button', { name: 'Create survey' }),
    );
};

describe('CreateSurvey', () => {
    it('creates the survey in the chosen project and opens its flag', async () => {
        const { createFlag } = setupApi({ projectId: 'marketing' });
        renderPage();

        await goToSettings();
        await userEvent.click(
            await screen.findByRole('combobox', { name: 'Project' }),
        );
        await userEvent.click(
            await screen.findByRole('option', { name: 'Marketing' }),
        );
        await submitSurvey();

        await screen.findByText('Flag page for marketing/survey-onboarding');
        await screen.findByText('Survey created');
        expect(createFlag.requests).toMatchObject([{ name: flagName }]);
    });

    it.each([
        ['the tag', { tagStatus: 500 }],
        ['the strategy', { strategyStatus: 500 }],
    ])('opens the flag with a warning when %s cannot be added', async (_, failure) => {
        setupApi(failure);
        renderPage();

        await goToSettings();
        await submitSurvey();

        await screen.findByText('Flag page for default/survey-onboarding');
        await screen.findByText(
            'Survey created, but some steps failed. Make sure the strategy is set up and the role:survey tag is applied.',
        );
    });

    it('sends survey responses to this instance', async () => {
        const { addStrategy } = setupApi();
        renderPage();

        await goToSettings();
        await submitSurvey();

        await screen.findByText('Survey created');
        expect(sentSurvey(addStrategy)).toMatchObject({
            submitBase: 'https://hosted.example.com/hosted',
        });
    });

    it('sends responses to the submit URL entered', async () => {
        const { addStrategy } = setupApi();
        renderPage();

        await goToSettings();
        const submitUrl = await screen.findByLabelText('Submit URL');
        await waitFor(() =>
            expect(submitUrl).toHaveValue('https://hosted.example.com/hosted'),
        );
        await userEvent.clear(submitUrl);
        await userEvent.type(submitUrl, 'https://other.example.com');
        await submitSurvey();

        await screen.findByText('Survey created');
        expect(sentSurvey(addStrategy)).toMatchObject({
            submitBase: 'https://other.example.com',
        });
    });

    it('does not create a survey without a URL to send responses to', async () => {
        const { createFlag } = setupApi();
        testServerRoute(server, '/api/admin/ui-config', {
            flags: { feedbackModule: true },
        });
        renderPage();

        await goToSettings();
        await submitSurvey();

        await screen.findByText(
            'Enter a URL starting with http:// or https://',
        );
        expect(createFlag.requests).toHaveLength(0);
    });

    it('rejects a flag name that is only the survey prefix', async () => {
        const { createFlag } = setupApi();
        renderPage();

        await goToSettings();
        await userEvent.click(
            await screen.findByRole('button', { name: 'Create survey' }),
        );

        await screen.findByText('Must start with "survey-" followed by a name');
        expect(createFlag.requests).toHaveLength(0);
    });

    it('sends the survey configured in the form', async () => {
        const { addStrategy } = setupApi();
        renderPage();

        const title = await screen.findByLabelText('Title');
        await userEvent.clear(title);
        await userEvent.type(title, 'Onboarding');
        const description = screen.getByLabelText('Description');
        await userEvent.clear(description);
        await userEvent.type(description, 'Two quick questions.');
        await userEvent.click(
            within(questionCard(1)).getByRole('button', {
                name: 'Remove question',
            }),
        );
        await goToSettings();
        await submitSurvey();

        await screen.findByText('Survey created');
        expect(sentSurvey(addStrategy)).toMatchObject({
            title: 'Onboarding',
            description: 'Two quick questions.',
            questions: [{ id: 'role' }, { id: 'comment' }],
        });
    });

    it('sends a survey without a title or description when the title slide is hidden', async () => {
        const { addStrategy } = setupApi();
        renderPage();

        await userEvent.clear(await screen.findByLabelText('Title'));
        await userEvent.click(
            screen.getByRole('checkbox', { name: 'Show title slide' }),
        );
        await waitFor(() =>
            expect(screen.queryByLabelText('Title')).not.toBeInTheDocument(),
        );
        await goToSettings();
        await submitSurvey();

        await screen.findByText('Survey created');
        expect(sentSurvey(addStrategy)).toMatchObject({
            title: null,
            description: null,
        });
    });

    it('shows an error from the first attempt to continue until it is fixed', async () => {
        setupApi();
        renderPage();
        const title = await screen.findByLabelText('Title');
        await userEvent.clear(title);
        expect(screen.queryByText('Enter a title')).not.toBeInTheDocument();

        await clickNext();
        await screen.findByText('Enter a title');
        await userEvent.type(title, 'Onboarding');

        expect(screen.queryByText('Enter a title')).not.toBeInTheDocument();
    });

    it('opens the settings without errors after the survey definition is fixed', async () => {
        setupApi();
        renderPage();
        const title = await screen.findByLabelText('Title');
        await userEvent.clear(title);
        await clickNext();
        await userEvent.type(title, 'Onboarding');

        await goToSettings();

        await screen.findByLabelText('Flag name');
        expect(screen.queryByText(/Must start with/)).not.toBeInTheDocument();
    });

    it('does not move on to the settings until the questions are complete', async () => {
        setupApi();
        renderPage();

        await userEvent.clear(
            await screen.findByRole('textbox', { name: 'Question 1' }),
        );
        await clickNext();

        await screen.findByText('Enter a question');
        expect(screen.queryByLabelText('Flag name')).not.toBeInTheDocument();
    });

    it('keeps what was entered when going back and forth between steps', async () => {
        setupApi();
        renderPage();

        const title = await screen.findByLabelText('Title');
        await userEvent.clear(title);
        await userEvent.type(title, 'Onboarding');
        await goToSettings();
        await userEvent.type(
            await screen.findByLabelText('Flag name'),
            'onboarding',
        );
        await userEvent.click(screen.getByRole('button', { name: 'Back' }));
        await userEvent.click(
            await screen.findByRole('button', { name: 'Back' }),
        );

        expect(await screen.findByLabelText('Title')).toHaveValue('Onboarding');
        await goToSettings();
        expect(await screen.findByLabelText('Flag name')).toHaveValue(flagName);
    });

    it('goes back to the survey definition from the stepper', async () => {
        setupApi();
        renderPage();

        await goToSettings();
        await userEvent.click(
            await screen.findByRole('button', { name: /Define survey/ }),
        );

        expect(await screen.findByLabelText('Title')).toBeInTheDocument();
    });

    it('moves focus to the first invalid field on every failed submit', async () => {
        setupApi();
        renderPage();
        const secondPrompt = await screen.findByRole('textbox', {
            name: 'Question 2',
        });
        await userEvent.clear(secondPrompt);
        await userEvent.clear(
            screen.getByRole('textbox', { name: 'Question 3' }),
        );

        await clickNext();
        await waitFor(() => expect(secondPrompt).toHaveFocus());

        await userEvent.click(screen.getByLabelText('Title'));
        await clickNext();
        await waitFor(() => expect(secondPrompt).toHaveFocus());
    });

    it('preselects "Whenever the survey is enabled" as the trigger', async () => {
        setupApi();
        renderPage();

        await goToTrigger();

        expect(
            screen.getByRole('radio', {
                name: 'Whenever the survey is enabled',
            }),
        ).toBeChecked();
    });

    it('keeps the chosen trigger when going back and forth between steps', async () => {
        setupApi();
        renderPage();

        await goToTrigger();
        await userEvent.click(
            screen.getByRole('radio', { name: 'When something happens' }),
        );
        await clickNext();
        await userEvent.click(
            await screen.findByRole('button', { name: 'Back' }),
        );

        expect(
            await screen.findByRole('radio', {
                name: 'When something happens',
            }),
        ).toBeChecked();
    });

    it('does not create the survey in a project the user cannot create flags in', async () => {
        const { createFlag } = setupApi();
        renderPage([{ permission: CREATE_FEATURE, project: 'marketing' }]);

        await goToSettings();
        await userEvent.type(
            await screen.findByLabelText('Flag name'),
            'onboarding',
        );
        const submit = screen.getByRole('button', { name: 'Access denied' });
        await userEvent.click(submit);

        expect(submit).toHaveAttribute('aria-disabled', 'true');
        expect(createFlag.requests).toHaveLength(0);
    });

    it('stays on the form and shows the error when the flag cannot be created', async () => {
        setupApi();
        testServerRoute(
            server,
            featuresPath('default'),
            { message: 'A flag with that name already exists' },
            'post',
            409,
        );
        renderPage();

        await goToSettings();
        await submitSurvey();

        await screen.findByText(/A flag with that name already exists/);
        expect(screen.queryByText(/Flag page/)).not.toBeInTheDocument();
    });
});
