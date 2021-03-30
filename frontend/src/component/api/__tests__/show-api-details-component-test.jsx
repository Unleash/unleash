import React from 'react';

import ShowApiDetailsComponent from '../show-api-details-component';
import renderer from 'react-test-renderer';

test('renders correctly with empty version', () => {
    const uiConfig = {
        name: 'Unleash',
        slogan: 'We are the best!',
        environment: 'test',
        version: '',
    };

    const tree = renderer.create(<ShowApiDetailsComponent uiConfig={uiConfig} />).toJSON();
    expect(tree).toMatchSnapshot();
});

test('renders correctly with ui-config', () => {
    const uiConfig = {
        name: 'Unleash',
        slogan: 'We are the best!',
        environment: 'test',
        version: '1.1.0',
    };

    const tree = renderer.create(<ShowApiDetailsComponent uiConfig={uiConfig} />).toJSON();
    expect(tree).toMatchSnapshot();
});

test('renders correctly without uiConfig', () => {
    const uiConfig = {
        name: 'Unleash',
        version: '1.1.0',
    };

    const tree = renderer.create(<ShowApiDetailsComponent uiConfig={uiConfig} />).toJSON();
    expect(tree).toMatchSnapshot();
});
