import React from 'react';

import ClientApplications from '../application-edit-component';
import renderer from 'react-test-renderer';

jest.mock('react-mdl');

test('renders correctly if no application', () => {
    const tree = renderer
        .create(<ClientApplications fetchApplication={jest.fn()} />)
        .toJSON();

    expect(tree).toMatchSnapshot();
});
