import React from 'react';

import ShowApiDetailsComponent from '../show-api-details-component';
import renderer from 'react-test-renderer';

jest.mock('react-mdl');

const uiConfig = {
    slogan: 'We are the best!',
    environment: 'test',
};

test('renders correctly with empty api details', () => {
    const tree = renderer
        .create(<ShowApiDetailsComponent fetchAll={jest.fn()} apiDetails={{}} uiConfig={uiConfig} />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});

test('renders correctly with details', () => {
    const tree = renderer
        .create(<ShowApiDetailsComponent fetchAll={jest.fn()} apiDetails={{ version: '1.1.0' }} uiConfig={uiConfig} />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});

test('renders correctly without uiConfig', () => {
    const tree = renderer
        .create(<ShowApiDetailsComponent fetchAll={jest.fn()} apiDetails={{ version: '1.1.0' }} uiConfig={{}} />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
