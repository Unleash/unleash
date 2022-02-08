import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core';

import FeatureToggleList from '../FeatureToggleList';
import renderer from 'react-test-renderer';
import theme from '../../../../themes/main-theme';
import { createFakeStore } from '../../../../accessStoreFake';
import {
    ADMIN,
    CREATE_FEATURE,
} from '../../../providers/AccessProvider/permissions';
import AccessProvider from '../../../providers/AccessProvider/AccessProvider';

jest.mock('../FeatureToggleListItem', () => ({
    __esModule: true,
    default: 'ListItem',
}));

jest.mock('../../../common/ProjectSelect');

test('renders correctly with one feature', () => {
    const features = [
        {
            name: 'Another',
        },
    ];

    const tree = renderer.create(
        <MemoryRouter>
            <ThemeProvider theme={theme}>
                <AccessProvider
                    store={createFakeStore([{ permission: CREATE_FEATURE }])}
                >
                    <FeatureToggleList
                        updateSetting={jest.fn()}
                        filter={{}}
                        setFilter={jest.fn()}
                        sort={{}}
                        setSort={jest.fn()}
                        features={features}
                        fetcher={jest.fn()}
                        flags={{}}
                    />
                </AccessProvider>
            </ThemeProvider>
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});

test('renders correctly with one feature without permissions', () => {
    const features = [
        {
            name: 'Another',
        },
    ];
    const tree = renderer.create(
        <MemoryRouter>
            <ThemeProvider theme={theme}>
                <AccessProvider
                    store={createFakeStore([{ permission: CREATE_FEATURE }])}
                >
                    <FeatureToggleList
                        filter={{}}
                        setFilter={jest.fn()}
                        sort={{}}
                        setSort={jest.fn()}
                        features={features}
                        fetcher={jest.fn()}
                        flags={{}}
                    />
                </AccessProvider>
            </ThemeProvider>
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});
