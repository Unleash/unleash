import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { Map as $Map } from 'immutable';

import Feature from './../feature-list-item-component';
import renderer from 'react-test-renderer';
import { UPDATE_FEATURE } from '../../../permissions';

jest.mock('react-mdl');

test('renders correctly with one feature', () => {
    const feature = {
        name: 'Another',
        description: "another's description",
        enabled: false,
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
    const store = { user: new $Map({ profile: { permissions: [UPDATE_FEATURE] } }) };
    const featureMetrics = { lastHour: {}, lastMinute: {}, seenApps: {} };
    const settings = { sort: 'name' };
    const tree = renderer.create(
        <Provider store={createStore(state => state, store)}>
            <MemoryRouter>
                <Feature
                    key={0}
                    settings={settings}
                    metricsLastHour={featureMetrics.lastHour[feature.name]}
                    metricsLastMinute={featureMetrics.lastMinute[feature.name]}
                    feature={feature}
                    toggleFeature={jest.fn()}
                />
            </MemoryRouter>
        </Provider>
    );

    expect(tree).toMatchSnapshot();
});

test('renders correctly with one feature without permission', () => {
    const feature = {
        name: 'Another',
        description: "another's description",
        enabled: false,
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
    const store = { user: new $Map({ profile: { permissions: [] } }) };
    const featureMetrics = { lastHour: {}, lastMinute: {}, seenApps: {} };
    const settings = { sort: 'name' };
    const tree = renderer.create(
        <Provider store={createStore(state => state, store)}>
            <MemoryRouter>
                <Feature
                    key={0}
                    settings={settings}
                    metricsLastHour={featureMetrics.lastHour[feature.name]}
                    metricsLastMinute={featureMetrics.lastMinute[feature.name]}
                    feature={feature}
                    toggleFeature={jest.fn()}
                />
            </MemoryRouter>
        </Provider>
    );

    expect(tree).toMatchSnapshot();
});
