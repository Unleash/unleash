import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { UIProviderContainer } from '../../providers/UIProvider/UIProviderContainer';
import AdvancedPlayground from './AdvancedPlayground';
import { createLocalStorage } from 'utils/createLocalStorage';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import userEvent from '@testing-library/user-event';

const testDisplayComponent = (
    <UIProviderContainer>
        <AdvancedPlayground
            FormComponent={props => (
                <div>
                    <div data-id="projects">
                        {JSON.stringify(props.projects)}
                    </div>
                    <div data-id="environments">
                        {JSON.stringify(props.environments)}
                    </div>
                    <div data-id="context">{JSON.stringify(props.context)}</div>
                </div>
            )}
        />
    </UIProviderContainer>
);

const testEvaluateComponent = (
    <UIProviderContainer>
        <AdvancedPlayground
            FormComponent={props => (
                <form onSubmit={props.onSubmit}>
                    <button>Submit</button>
                </form>
            )}
        />
    </UIProviderContainer>
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
        screen.getByText('["development","production"]')
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
        400
    );

    render(testEvaluateComponent);

    const user = userEvent.setup();
    const submitButton = screen.getByText('Submit');
    user.click(submitButton);

    await screen.findByText('some error about too many items');
});
