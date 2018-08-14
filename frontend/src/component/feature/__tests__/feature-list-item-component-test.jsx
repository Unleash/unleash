import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import Feature from './../feature-list-item-component';
import renderer from 'react-test-renderer';

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
    const featureMetrics = { lastHour: {}, lastMinute: {}, seenApps: {} };
    const settings = { sort: 'name' };
    const tree = renderer.create(
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
    );

    expect(tree).toMatchSnapshot();
});
