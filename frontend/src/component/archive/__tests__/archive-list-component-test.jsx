import React from 'react';

import ArchiveList from '../archive-list-component';
import renderer from 'react-test-renderer';

jest.mock('react-mdl');

const archive = [
    {
        name: 'adin-pay-confirm-disabled',
        description: 'Disables the confirm-functionality from API',
        enabled: false,
        strategies: [{ name: 'default', parameters: {} }],
        createdAt: '2016-10-25T15:38:28.573Z',
        reviveName: 'adin-pay-confirm-disabled',
    }, {
        name: 'adin-pay-platform-sch-payment',
        description: 'Enables use of schibsted payment from order-payment-management',
        enabled: true,
        strategies: [{ name: 'default', parameters: {} }],
        createdAt: '2016-08-03T12:41:35.631Z',
        reviveName: 'adin-pay-platform-sch-payment',
    },
];

test('renders correctly with no archived toggles', () => {
    const tree = renderer.create(
        <ArchiveList fetchArchive={jest.fn()} archive={[]} />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});

test('renders correctly with archived toggles', () => {
    const tree = renderer.create(
        <ArchiveList fetchArchive={jest.fn()} archive={archive} />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});
