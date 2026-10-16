import { test } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import EditTagType from './EditTagType.tsx';

const server = testServerSetup();

test('shows the values of the tag type', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { tagManagementViaUi: true },
    });
    testServerRoute(server, '/api/admin/tag-types/team', {
        tagType: { name: 'team', description: '' },
    });
    testServerRoute(server, '/api/admin/tag-types/team/values', {
        limit: 1000,
        offset: 0,
        total: 1,
        tagValues: [
            {
                value: 'frontend',
                usedInActiveFeatures: 0,
                usedInArchivedFeatures: 0,
            },
        ],
    });

    render(
        <Routes>
            <Route path='/tag-types/edit/:name' element={<EditTagType />} />
        </Routes>,
        { route: '/tag-types/edit/team' },
    );

    await screen.findByText('frontend');
});
