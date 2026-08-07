import { test } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { testServerSetup } from 'utils/testServer';
import ToastRenderer from 'component/common/ToastRenderer/ToastRenderer';
import { FeatureStaleDialog } from './FeatureStaleDialog.tsx';

const server = testServerSetup();

const projectId = 'default';
const featureId = 'my-flag';
const featurePath = `/api/admin/projects/${projectId}/features/${featureId}`;

const renderDialog = () =>
    render(
        <>
            <FeatureStaleDialog
                isStale={false}
                isOpen={true}
                projectId={projectId}
                featureId={featureId}
                onClose={() => {}}
            />
            <ToastRenderer />
        </>,
    );

test('confirms the flag was marked stale when the patch succeeds', async () => {
    server.use(http.patch(featurePath, () => HttpResponse.json({})));
    renderDialog();

    await userEvent.click(
        screen.getByRole('button', { name: /flip to stale/i }),
    );

    await screen.findByText('The flag has been marked as stale');
});

test('shows the API error when the patch fails', async () => {
    server.use(
        http.patch(featurePath, () =>
            HttpResponse.json(
                { details: [{ message: 'Could not update the flag' }] },
                { status: 500 },
            ),
        ),
    );
    renderDialog();

    await userEvent.click(
        screen.getByRole('button', { name: /flip to stale/i }),
    );

    await screen.findByText('Could not update the flag');
});
