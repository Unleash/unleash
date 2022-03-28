import { ThemeProvider } from '@material-ui/core';
import { ApplicationEdit } from './ApplicationEdit';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import theme from 'themes/mainTheme';
import AccessProvider from 'component/providers/AccessProvider/AccessProvider';
import UIProvider from 'component/providers/UIProvider/UIProvider';

test('renders correctly if no application', () => {
    const tree = renderer
        .create(
            <AccessProvider permissions={[{ permission: ADMIN }]}>
                <ThemeProvider theme={theme}>
                    <UIProvider>
                        <MemoryRouter initialEntries={['/test']}>
                            <ApplicationEdit
                                fetchApplication={() => Promise.resolve({})}
                                storeApplicationMetaData={jest.fn()}
                                deleteApplication={jest.fn()}
                                locationSettings={{ locale: 'en-GB' }}
                            />
                        </MemoryRouter>
                    </UIProvider>
                </ThemeProvider>
            </AccessProvider>
        )
        .toJSON();

    expect(tree).toMatchSnapshot();
});

test('renders correctly without permission', () => {
    const tree = renderer
        .create(
            <MemoryRouter>
                <ThemeProvider theme={theme}>
                    <UIProvider>
                        <AccessProvider permissions={[{ permission: ADMIN }]}>
                            <ApplicationEdit
                                fetchApplication={() => Promise.resolve({})}
                                storeApplicationMetaData={jest.fn()}
                                deleteApplication={jest.fn()}
                                application={{
                                    appName: 'test-app',
                                    instances: [
                                        {
                                            instanceId: 'instance-1',
                                            clientIp: '123.123.123.123',
                                            lastSeen: '2017-02-23T15:56:49',
                                            sdkVersion: '4.0',
                                        },
                                    ],
                                    strategies: [
                                        {
                                            name: 'StrategyA',
                                            description: 'A description',
                                        },
                                        {
                                            name: 'StrategyB',
                                            description: 'B description',
                                            notFound: true,
                                        },
                                    ],
                                    seenToggles: [
                                        {
                                            name: 'ToggleA',
                                            description: 'this is A toggle',
                                            enabled: true,
                                            project: 'default',
                                        },
                                        {
                                            name: 'ToggleB',
                                            description: 'this is B toggle',
                                            enabled: false,
                                            notFound: true,
                                            project: 'default',
                                        },
                                    ],
                                    url: 'http://example.org',
                                    description: 'app description',
                                }}
                                locationSettings={{ locale: 'en-GB' }}
                            />
                        </AccessProvider>
                    </UIProvider>
                </ThemeProvider>
            </MemoryRouter>
        )
        .toJSON();

    expect(tree).toMatchSnapshot();
});

test('renders correctly with permissions', () => {
    const tree = renderer
        .create(
            <MemoryRouter>
                <ThemeProvider theme={theme}>
                    <UIProvider>
                        <AccessProvider permissions={[{ permission: ADMIN }]}>
                            <ApplicationEdit
                                fetchApplication={() => Promise.resolve({})}
                                storeApplicationMetaData={jest.fn()}
                                deleteApplication={jest.fn()}
                                application={{
                                    appName: 'test-app',
                                    instances: [
                                        {
                                            instanceId: 'instance-1',
                                            clientIp: '123.123.123.123',
                                            lastSeen: '2017-02-23T15:56:49',
                                            sdkVersion: '4.0',
                                        },
                                    ],
                                    strategies: [
                                        {
                                            name: 'StrategyA',
                                            description: 'A description',
                                        },
                                        {
                                            name: 'StrategyB',
                                            description: 'B description',
                                            notFound: true,
                                        },
                                    ],
                                    seenToggles: [
                                        {
                                            name: 'ToggleA',
                                            description: 'this is A toggle',
                                            enabled: true,
                                            project: 'default',
                                        },
                                        {
                                            name: 'ToggleB',
                                            description: 'this is B toggle',
                                            enabled: false,
                                            notFound: true,
                                            project: 'default',
                                        },
                                    ],
                                    url: 'http://example.org',
                                    description: 'app description',
                                }}
                                locationSettings={{ locale: 'en-GB' }}
                            />
                        </AccessProvider>
                    </UIProvider>
                </ThemeProvider>
            </MemoryRouter>
        )
        .toJSON();

    expect(tree).toMatchSnapshot();
});
