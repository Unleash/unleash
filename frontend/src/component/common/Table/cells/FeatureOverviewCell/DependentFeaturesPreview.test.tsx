import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { PrimaryFeatureInfo } from './FeatureOverviewCell.tsx';
import userEvent from '@testing-library/user-event';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

test('Preview parent feature', async () => {
    testServerRoute(server, '/api/admin/projects/default/features/featureA', {
        children: [],
        dependencies: [{ feature: 'featureB' }],
    });

    render(
        <PrimaryFeatureInfo
            feature='featureA'
            project='default'
            type='release'
            archivedAt={null}
            searchQuery=''
            dependencyType='child'
            onTypeClick={() => {}}
            delay={0}
        />,
    );

    const childBadge = screen.getByText('child');
    userEvent.hover(childBadge);

    await screen.findByText('Loading...');

    await screen.findByText('Parent');
    await screen.findByText('featureB');
});

test('Preview child features', async () => {
    testServerRoute(server, '/api/admin/projects/default/features/featureA', {
        children: ['featureB', 'featureC'],
        dependencies: [],
    });

    render(
        <PrimaryFeatureInfo
            feature='featureA'
            project='default'
            type='release'
            archivedAt={null}
            searchQuery=''
            dependencyType='parent'
            onTypeClick={() => {}}
            delay={0}
        />,
    );

    const parentBadge = screen.getByText('parent');
    userEvent.hover(parentBadge);

    await screen.findByText('Loading...');

    await screen.findByText('Children');
    await screen.findByText('featureB');
    await screen.findByText('featureC');
});
