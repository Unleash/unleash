import React from 'react';

import ClientStrategies from '../client-instance-component';
import renderer from 'react-test-renderer';

jest.mock('react-mdl');

test('renders correctly with no clientInstances', () => {
    const tree = renderer
        .create(
            <ClientStrategies
                fetchClientInstances={jest.fn()}
                clientInstances={[]}
            />
        )
        .toJSON();

    expect(tree).toMatchSnapshot();
});
