import { render, screen } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FeatureToggleSwitch } from './FeatureToggleSwitch';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { FC } from 'react';
import { UIProviderContainer } from 'component/providers/UIProvider/UIProviderContainer';
import { ThemeProvider } from '../../../../../themes/ThemeProvider';
import { AccessProviderMock } from 'component/providers/AccessProvider/AccessProviderMock';
import { UPDATE_FEATURE_ENVIRONMENT } from 'component/providers/AccessProvider/permissions';

const server = testServerSetup();

const UnleashUiSetup: FC<{ path: string; pathTemplate: string }> = ({
    children,
    path,
    pathTemplate,
}) => (
    <UIProviderContainer>
        <AccessProviderMock
            permissions={[{ permission: UPDATE_FEATURE_ENVIRONMENT }]}
        >
            <MemoryRouter initialEntries={[path]}>
                <ThemeProvider>
                    {/*<AnnouncerProvider>*/}
                    <Routes>
                        <Route path={pathTemplate} element={children} />
                    </Routes>
                    {/*</AnnouncerProvider>*/}
                </ThemeProvider>
            </MemoryRouter>
        </AccessProviderMock>
    </UIProviderContainer>
);

test('it should show prod guard when production environment', async () => {
    testServerRoute(server, '/api/admin/ui-config', {});
    testServerRoute(
        server,
        '/api/admin/projects/default/features/somefeature',
        {
            name: 'feature1',
            environments: [
                {
                    name: 'env1',
                    type: 'production',
                    enabled: false,
                    strategies: [],
                },
                {
                    name: 'env2',
                    type: 'development',
                    enabled: false,
                    strategies: [],
                },
            ],
        }
    );

    render(
        <UnleashUiSetup
            path={
                '/projects/default/features/somefeature?variantEnvironments=true'
            }
            pathTemplate={'/projects/:projectId/features/:featureId/*'}
        >
            <FeatureToggleSwitch
                featureId={'somefeature'}
                environmentName={'env1'}
                projectId={'default'}
                value={false}
            />
        </UnleashUiSetup>
    );

    const toggle = screen.getByTestId(`permission-switch`);
    toggle.click();
    await screen.findByText('Changing production environment');
});
