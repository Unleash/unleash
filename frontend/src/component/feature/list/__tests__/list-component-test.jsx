import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import FeatureListComponent from './../list-component';
import renderer from 'react-test-renderer';
import { CREATE_FEATURE } from '../../../../permissions';

jest.mock('react-mdl');
jest.mock('../list-item-component', () => ({
    __esModule: true,
    default: 'ListItem',
}));

jest.mock('../project-container', () => 'Project');

test('renders correctly with one feature', () => {
    const features = [
        {
            name: 'Another',
        },
    ];
    const featureMetrics = { lastHour: {}, lastMinute: {}, seenApps: {} };
    const settings = { sort: 'name' };
    const tree = renderer.create(
        <MemoryRouter>
            <FeatureListComponent
                updateSetting={jest.fn()}
                settings={settings}
                history={{}}
                featureMetrics={featureMetrics}
                features={features}
                toggleFeature={jest.fn()}
                fetchFeatureToggles={jest.fn()}
                hasPermission={permission => permission === CREATE_FEATURE}
            />
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
    const featureMetrics = { lastHour: {}, lastMinute: {}, seenApps: {} };
    const settings = { sort: 'name' };
    const tree = renderer.create(
        <MemoryRouter>
            <FeatureListComponent
                updateSetting={jest.fn()}
                settings={settings}
                history={{}}
                featureMetrics={featureMetrics}
                features={features}
                toggleFeature={jest.fn()}
                fetchFeatureToggles={jest.fn()}
                hasPermission={() => false}
            />
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});
