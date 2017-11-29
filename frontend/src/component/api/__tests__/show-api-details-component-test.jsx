import React from 'react';

import ShowApiDetailsComponent from '../show-api-details-component';
import renderer from 'react-test-renderer';

jest.mock('react-mdl');

test('renders correctly with empty api details', () => {
    const tree = renderer.create(<ShowApiDetailsComponent fetchAll={jest.fn()} apiDetails={{}} />).toJSON();
    expect(tree).toMatchSnapshot();
});

test('renders correctly with details', () => {
    const tree = renderer
        .create(<ShowApiDetailsComponent fetchAll={jest.fn()} apiDetails={{ version: '1.1.0' }} />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
