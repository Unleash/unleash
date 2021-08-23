import React from 'react';

import { ThemeProvider } from '@material-ui/core';
import ClientApplications from '../application-edit-component';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { ADMIN } from '../../AccessProvider/permissions';
import theme from '../../../themes/main-theme';

import { createFakeStore } from '../../../accessStoreFake';
import AccessProvider from '../../AccessProvider/AccessProvider';

test('renders correctly if no application', () => {
    const tree = renderer
        .create(
            <AccessProvider store={createFakeStore([{ permission: ADMIN }])}>
                <ClientApplications
                    fetchApplication={() => Promise.resolve({})}
                    storeApplicationMetaData={jest.fn()}
                    deleteApplication={jest.fn()}
                    history={{}}
                />
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
                    <AccessProvider store={createFakeStore([])}>
                        <ClientApplications
                            fetchApplication={() => Promise.resolve({})}
                            storeApplicationMetaData={jest.fn()}
                            deleteApplication={jest.fn()}
                            history={{}}
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
                                    },
                                    {
                                        name: 'ToggleB',
                                        description: 'this is B toggle',
                                        enabled: false,
                                        notFound: true,
                                    },
                                ],
                                url: 'http://example.org',
                                description: 'app description',
                            }}
                            location={{ locale: 'en-GB' }}
                        />
                    </AccessProvider>
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
                    <AccessProvider
                        store={createFakeStore([{ permission: ADMIN }])}
                    >
                        <ClientApplications
                            fetchApplication={() => Promise.resolve({})}
                            storeApplicationMetaData={jest.fn()}
                            history={{}}
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
                                    },
                                    {
                                        name: 'ToggleB',
                                        description: 'this is B toggle',
                                        enabled: false,
                                        notFound: true,
                                    },
                                ],
                                url: 'http://example.org',
                                description: 'app description',
                            }}
                            location={{ locale: 'en-GB' }}
                        />
                    </AccessProvider>
                </ThemeProvider>
            </MemoryRouter>
        )
        .toJSON();

    expect(tree).toMatchSnapshot();
});
