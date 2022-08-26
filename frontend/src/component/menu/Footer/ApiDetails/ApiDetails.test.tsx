import React from 'react';
import { ApiDetails } from 'component/menu/Footer/ApiDetails/ApiDetails';
import { render } from 'utils/testRenderer';

test('renders correctly with empty version', () => {
    const uiConfig = {
        name: 'Unleash',
        slogan: 'We are the best!',
        environment: 'test',
        version: '',
    };

    render(<ApiDetails uiConfig={uiConfig} />);
    expect(document.body).toMatchSnapshot();
});

test('renders correctly with ui-config', () => {
    const uiConfig = {
        name: 'Unleash',
        slogan: 'We are the best!',
        environment: 'test',
        version: '1.1.0',
    };

    render(<ApiDetails uiConfig={uiConfig} />);
    expect(document.body).toMatchSnapshot();
});

test('renders correctly without uiConfig', () => {
    const uiConfig = {
        name: 'Unleash',
        version: '1.1.0',
    };

    render(<ApiDetails uiConfig={uiConfig} />);
    expect(document.body).toMatchSnapshot();
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

    render(<ApiDetails uiConfig={uiConfig} />);
    expect(document.body).toMatchSnapshot();
});
