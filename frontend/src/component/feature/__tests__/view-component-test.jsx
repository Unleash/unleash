import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import ViewFeatureToggleComponent from './../view-component';
import renderer from 'react-test-renderer';
import { DELETE_FEATURE, UPDATE_FEATURE } from '../../../permissions';

jest.mock('react-mdl');
jest.mock('../form/form-update-feature-container', () => ({
    __esModule: true,
    default: 'UpdateFeatureToggleComponent',
}));
jest.mock('../form/feature-type-select-container', () => 'FeatureTypeSelect');

test('renders correctly with one feature', () => {
    const feature = {
        name: 'Another',
        description: "another's description",
        enabled: false,
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
                hasPermission={permission => [DELETE_FEATURE, UPDATE_FEATURE].indexOf(permission) !== -1}
            />
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});
