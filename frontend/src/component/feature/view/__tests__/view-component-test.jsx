import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import ViewFeatureToggleComponent from './../view-component';
import renderer from 'react-test-renderer';
import { DELETE_FEATURE, UPDATE_FEATURE } from '../../../../permissions';

jest.mock('react-mdl');
jest.mock('../update-strategies-container', () => ({
    __esModule: true,
    default: 'UpdateStrategiesComponent',
}));
jest.mock('../../feature-type-select-container', () => 'FeatureTypeSelect');
jest.mock('../../project-select-container', () => 'ProjectSelect');
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
    const tree = renderer.create(
        <MemoryRouter>
            <ViewFeatureToggleComponent
                activeTab={'strategies'}
                featureToggleName="another"
                features={[feature]}
                featureToggle={feature}
                fetchFeatureToggles={jest.fn()}
                history={{}}
                featureTags={[]}
                hasPermission={permission => [DELETE_FEATURE, UPDATE_FEATURE].indexOf(permission) !== -1}
                fetchTags={jest.fn()}
                untagFeature={jest.fn()}
            />
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});
