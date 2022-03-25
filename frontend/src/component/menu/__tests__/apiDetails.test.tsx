import React from 'react';
import renderer from 'react-test-renderer';
import { ApiDetails } from '../Footer/ApiDetails/ApiDetails';

test('renders correctly with empty version', () => {
    const uiConfig = {
        name: 'Unleash',
        slogan: 'We are the best!',
        environment: 'test',
        version: '',
    };

    const tree = renderer.create(<ApiDetails uiConfig={uiConfig} />).toJSON();
    expect(tree).toMatchSnapshot();
});

test('renders correctly with ui-config', () => {
    const uiConfig = {
        name: 'Unleash',
        slogan: 'We are the best!',
        environment: 'test',
        version: '1.1.0',
    };

    const tree = renderer.create(<ApiDetails uiConfig={uiConfig} />).toJSON();
    expect(tree).toMatchSnapshot();
});

test('renders correctly without uiConfig', () => {
    const uiConfig = {
        name: 'Unleash',
        version: '1.1.0',
    };

    const tree = renderer.create(<ApiDetails uiConfig={uiConfig} />).toJSON();
    expect(tree).toMatchSnapshot();
});

test('renders correctly with versionInfo', () => {
    const uiConfig = {
        name: 'Unleash',
        version: '1.2.3',
        versionInfo: {
            instanceId: '1',
            isLatest: false,
            current: { enterprise: '1.2.3', oss: '1.2.3' },
            latest: { enterprise: '1.2.4', oss: '1.2.4' },
        },
    };

    const tree = renderer.create(<ApiDetails uiConfig={uiConfig} />).toJSON();
    expect(tree).toMatchSnapshot();
});
