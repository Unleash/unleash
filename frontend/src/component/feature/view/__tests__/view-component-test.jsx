import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createStore } from 'redux';

import { Provider } from 'react-redux';

import { ThemeProvider } from '@material-ui/core';
import ViewFeatureToggleComponent from '../../FeatureView/FeatureView';
import renderer from 'react-test-renderer';
import { ADMIN, DELETE_FEATURE, UPDATE_FEATURE } from '../../../AccessProvider/permissions';

import theme from '../../../../themes/main-theme';
import { createFakeStore } from '../../../../accessStoreFake';
import AccessProvider from '../../../AccessProvider/AccessProvider';

jest.mock('../update-strategies-container', () => ({
    __esModule: true,
    default: 'UpdateStrategiesComponent',
}));
jest.mock('../../feature-type-select-container', () => 'FeatureTypeSelect');
jest.mock('../../../common/ProjectSelect', () => 'ProjectSelect');
jest.mock('../../tag-type-select-container', () => 'TagTypeSelect');
jest.mock('../../feature-tag-component', () => 'FeatureTagComponent');
jest.mock('../../add-tag-dialog-container', () => 'AddTagDialog');

test('renders correctly with one feature', () => {
    const feature = {
        name: 'Another',
        description: "another's description",
        enabled: false,
        stale: false,
        type: 'release',
        strategies: [
            {
                name: 'gradualRolloutRandom',
                parameters: {
                    percentage: 50,
                },
            },
        ],
        createdAt: '2018-02-04T20:27:52.127Z',
    };

    const mockStore = {
        projects: {
            toJS: () => [
                { id: 'default', initial: false, name: 'Default' },
                { id: 'myProject', initial: false, name: 'MyProject' },
            ],
        },
        uiConfig: {
            toJS: () => ({
                flags: {
                    P: true,
                },
            }),
        },
    };

    const mockReducer = state => state;

    const tree = renderer.create(
        <MemoryRouter>
            <Provider store={createStore(mockReducer, mockStore)}>
                <ThemeProvider theme={theme}>
                    <AccessProvider store={createFakeStore([{permission: ADMIN}])}>
                    <ViewFeatureToggleComponent
                        activeTab={'strategies'}
                        featureToggleName="another"
                        features={[feature]}
                        featureToggle={feature}
                        fetchFeatureToggles={jest.fn()}
                        history={{}}
                        featureTags={[]}
                        fetchTags={jest.fn()}
                        untagFeature={jest.fn()}
                    />
                    </AccessProvider>
                </ThemeProvider>
            </Provider>
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});
