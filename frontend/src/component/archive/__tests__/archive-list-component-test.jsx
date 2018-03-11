import React from 'react';

import ArchiveList from '../archive-list-component';
import renderer from 'react-test-renderer';

jest.mock('react-mdl');
// TODO mock DropdownButton
// jest.mock('../../common', () => ({ DropdownButton: 'DropdownButton', styles: {} }));
const archive = [
    {
        name: 'adin-pay-confirm-disabled',
        description: 'Disables the confirm-functionality from API',
        enabled: false,
        strategies: [{ name: 'default', parameters: {} }],
        createdAt: '2016-10-25T15:38:28.573Z',
        reviveName: 'adin-pay-confirm-disabled',
    },
    {
        name: 'adin-pay-platform-sch-payment',
        description: 'Enables use of schibsted payment from order-payment-management',
        enabled: true,
        strategies: [{ name: 'default', parameters: {} }],
        createdAt: '2016-08-03T12:41:35.631Z',
        reviveName: 'adin-pay-platform-sch-payment',
    },
];

xtest('renders correctly with no archived toggles', () => {
    const featureMetrics = { lastHour: {}, lastMinute: {}, seenApps: {} };
    const settings = {
        feature: {
            filter: '',
            sort: 'name',
            showLastHour: false,
        },
    };

    const tree = renderer
        .create(
            <ArchiveList
                name={'ff'}
                fetchArchive={jest.fn()}
                archive={[]}
                settings={settings}
                featureMetrics={featureMetrics}
            />
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});

xtest('renders correctly with archived toggles', () => {
    const featureMetrics = { lastHour: {}, lastMinute: {}, seenApps: {} };
    const settings = {
        feature: {
            filter: '',
            sort: 'name',
            showLastHour: false,
        },
    };

    const tree = renderer
        .create(
            <ArchiveList
                name={'ff'}
                fetchArchive={jest.fn()}
                archive={archive}
                settings={settings}
                featureMetrics={featureMetrics}
            />
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});
