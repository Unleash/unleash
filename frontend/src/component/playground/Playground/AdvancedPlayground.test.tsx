import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import AdvancedPlayground from './AdvancedPlayground.tsx';
import { createLocalStorage } from 'utils/createLocalStorage';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import userEvent from '@testing-library/user-event';

const testDisplayComponent = (
    <AdvancedPlayground
        FormComponent={(props) => (
            <div>
                <div data-id='projects'>{JSON.stringify(props.projects)}</div>
                <div data-id='environments'>
                    {JSON.stringify(props.environments)}
                </div>
                <div data-id='context'>{JSON.stringify(props.context)}</div>
            </div>
        )}
    />
);

const testEvaluateComponent = (
    <AdvancedPlayground
        FormComponent={(props) => (
            <form onSubmit={props.onSubmit}>
                <button type='submit'>Submit</button>
            </form>
        )}
    />
);

afterEach(() => {
    const { setValue } = createLocalStorage('AdvancedPlayground:v1', {});
    setValue({});
});

test('should fetch initial form data from local storage', async () => {
    const { setValue } = createLocalStorage('AdvancedPlayground:v1', {});
    setValue({
        projects: ['projectA', 'projectB'],
        environments: ['development', 'production'],
        context: { userId: '1' },
    });

    render(testDisplayComponent);

    expect(screen.getByText('Unleash playground')).toBeInTheDocument();
    expect(screen.getByText('["projectA","projectB"]')).toBeInTheDocument();
    expect(
        screen.getByText('["development","production"]'),
    ).toBeInTheDocument();
    expect(screen.getByText('{"userId":"1"}')).toBeInTheDocument();
});

test('should fetch initial form data from url', async () => {
    const { setValue } = createLocalStorage('AdvancedPlayground:v1', {});
    setValue({
        projects: ['projectA', 'projectB'],
        environments: ['development', 'production'],
        context: { userId: '1' },
    });

    render(testDisplayComponent, {
        route: '/playground?context=customContext&environments=customEnv&projects=urlProject&sort=name',
    });

    expect(screen.getByText('Unleash playground')).toBeInTheDocument();
    expect(screen.getByText('["urlProject"]')).toBeInTheDocument();
    expect(screen.getByText('["customEnv"]')).toBeInTheDocument();
    expect(screen.getByText('"customContext"')).toBeInTheDocument();
});

const server = testServerSetup();

test('should display error on submit', async () => {
    testServerRoute(
        server,
        '/api/admin/playground/advanced',
        {
            name: 'BadDataError',
            details: [{ message: 'some error about too many items' }],
        },
        'post',
        400,
    );

    render(testEvaluateComponent);

    const user = userEvent.setup();
    const submitButton = screen.getByText('Submit');
    await user.click(submitButton);

    await screen.findByText('some error about too many items');
});

describe('context warnings on successful evaluation', () => {
    const warningSummaryText =
        'Some context properties were not taken into account during evaluation';

    test('should show context warnings if they exist in the response', async () => {
        const response = {
            features: [],
            input: {
                environments: [],
                projects: [],
                context: {},
            },
            warnings: {
                invalidContextProperties: [
                    'empty array',
                    'true',
                    'false',
                    'number',
                    'null',
                    'accountId',
                    'object',
                ],
            },
        };
        testServerRoute(
            server,
            '/api/admin/playground/advanced',
            response,
            'post',
            200,
        );

        render(testEvaluateComponent);

        const user = userEvent.setup();
        const submitButton = screen.getByText('Submit');
        await user.click(submitButton);

        await screen.findByText(warningSummaryText, { exact: false });
        for (const prop of response.warnings.invalidContextProperties) {
            await screen.findByText(prop);
        }
    });

    test('sorts context warnings alphabetically', async () => {
        const response = {
            features: [],
            input: {
                environments: [],
                projects: [],
                context: {},
            },
            warnings: {
                invalidContextProperties: ['b', 'a', 'z'],
            },
        };
        testServerRoute(
            server,
            '/api/admin/playground/advanced',
            response,
            'post',
            200,
        );

        render(testEvaluateComponent);

        const user = userEvent.setup();
        const submitButton = screen.getByText('Submit');
        await user.click(submitButton);

        const warnings = screen.getAllByTestId('context-warning-list-element');

        expect(warnings[0]).toHaveTextContent('a');
        expect(warnings[1]).toHaveTextContent('b');
        expect(warnings[2]).toHaveTextContent('z');
    });

    test('does not render context warnings if the list of properties is empty', async () => {
        const response = {
            features: [],
            input: {
                environments: [],
                projects: [],
                context: {},
            },
            warnings: {
                invalidContextProperties: [],
            },
        };
        testServerRoute(
            server,
            '/api/admin/playground/advanced',
            response,
            'post',
            200,
        );

        render(testEvaluateComponent);

        const user = userEvent.setup();
        const submitButton = screen.getByText('Submit');
        await user.click(submitButton);

        const warningSummary = screen.queryByText(warningSummaryText, {
            exact: false,
        });

        expect(warningSummary).toBeNull();
    });

    test("should not show context warnings if they don't exist in the response", async () => {
        testServerRoute(
            server,
            '/api/admin/playground/advanced',
            {
                features: [],
                input: {
                    environments: [],
                    projects: [],
                    context: {},
                },
                warnings: {},
            },
            'post',
            200,
        );

        render(testEvaluateComponent);

        const user = userEvent.setup();
        const submitButton = screen.getByText('Submit');
        await user.click(submitButton);

        const warningSummary = screen.queryByText(warningSummaryText, {
            exact: false,
        });

        expect(warningSummary).toBeNull();
    });
});
