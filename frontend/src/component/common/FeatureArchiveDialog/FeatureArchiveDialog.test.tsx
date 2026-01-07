import { vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FeatureArchiveDialog } from './FeatureArchiveDialog.tsx';

const server = testServerSetup();
const setupHappyPathForChangeRequest = () => {
    testServerRoute(
        server,
        '/api/admin/projects/projectId/environments/development/change-requests',
        {},
        'post',
    );
    testServerRoute(
        server,
        '/api/admin/projects/projectId/change-requests/config',
        [
            {
                environment: 'development',
                type: 'development',
                requiredApprovals: 1,
                changeRequestEnabled: true,
            },
        ],
    );
};
const setupArchiveValidation = (orphanParents: string[]) => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { oss: 'version', enterprise: 'version' },
        },
    });
    testServerRoute(
        server,
        '/api/admin/projects/projectId/archive/validate',
        {
            hasDeletedDependencies: true,
            parentsWithChildFeatures: orphanParents,
        },
        'post',
    );
};

const setupFlagScheduleConflicts = (
    scheduledCRs: { id: number; title?: string }[],
) => {
    testServerRoute(
        server,
        '/api/admin/projects/projectId/change-requests/scheduled',
        scheduledCRs,
    );
};

test('Add single archive feature change to change request', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    setupHappyPathForChangeRequest();
    setupArchiveValidation([]);
    render(
        <FeatureArchiveDialog
            featureIds={['featureA']}
            projectId={'projectId'}
            isOpen={true}
            onClose={onClose}
            onConfirm={onConfirm}
            featuresWithUsage={[]}
        />,
    );

    expect(screen.getByText('Archive feature flag')).toBeInTheDocument();
    await screen.findByText(
        'Archiving flags with dependencies will also remove those dependencies.',
    );
    const button = await screen.findByText('Add change to draft');

    button.click();

    await waitFor(() => {
        expect(onConfirm).toBeCalledTimes(1);
    });
    expect(onClose).toBeCalledTimes(1);
});

test('Add multiple archive feature changes to change request', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    setupHappyPathForChangeRequest();
    setupArchiveValidation([]);
    render(
        <FeatureArchiveDialog
            featureIds={['featureA', 'featureB']}
            projectId={'projectId'}
            isOpen={true}
            onClose={onClose}
            onConfirm={onConfirm}
            featuresWithUsage={[]}
        />,
    );

    await screen.findByText('Archive feature flags');
    await screen.findByText(
        'Archiving flags with dependencies will also remove those dependencies.',
    );
    const button = await screen.findByText('Add to change request');

    button.click();

    await waitFor(() => {
        expect(onConfirm).toBeCalledTimes(1);
    });
    expect(onClose).toBeCalledTimes(1);
});

test('Skip change request does not affect archive', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    setupHappyPathForChangeRequest();
    setupArchiveValidation([]);
    render(
        <FeatureArchiveDialog
            featureIds={['featureA']}
            projectId={'projectId'}
            isOpen={true}
            onClose={onClose}
            onConfirm={onConfirm}
            featuresWithUsage={[]}
        />,
        { permissions: [{ permission: 'SKIP_CHANGE_REQUEST' }] },
    );

    await screen.findByText('Archive feature flag');
    const button = await screen.findByText('Add change to draft');

    await waitFor(() => expect(button).toBeEnabled());

    button.click();

    await waitFor(() => {
        expect(onClose).toBeCalledTimes(1);
    });
    expect(onConfirm).toBeCalledTimes(1);
});

test('Show error message when multiple parents of orphaned children are archived', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    setupArchiveValidation(['parentA', 'parentB']);
    render(
        <FeatureArchiveDialog
            featureIds={['parentA', 'parentB']}
            projectId={'projectId'}
            isOpen={true}
            onClose={onClose}
            onConfirm={onConfirm}
            featuresWithUsage={[]}
        />,
    );

    await screen.findByText('2 feature flags');
    await screen.findByText(
        'have child features that depend on them and are not part of the archive operation. These parent features can not be archived:',
    );
    expect(
        screen.queryByText(
            'Archiving flags with dependencies will also remove those dependencies.',
        ),
    ).not.toBeInTheDocument();
});

test('Show error message when 1 parent of orphaned children is archived', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    setupArchiveValidation(['parent']);
    render(
        <FeatureArchiveDialog
            featureIds={['parent', 'someOtherFeature']}
            projectId={'projectId'}
            isOpen={true}
            onClose={onClose}
            onConfirm={onConfirm}
            featuresWithUsage={[]}
        />,
    );

    await screen.findByText('parent');
    await screen.findByText(
        'has child features that depend on it and are not part of the archive operation.',
    );
    expect(
        screen.queryByText(
            'Archiving flags with dependencies will also remove those dependencies.',
        ),
    ).not.toBeInTheDocument();
});

describe('schedule conflicts', () => {
    test.each([
        1, 2, 5, 10,
    ])('Shows a warning when archiving %s flag(s) with change request schedule conflicts', async (numberOfFlags) => {
        setupArchiveValidation([]);
        const featureIds = new Array(numberOfFlags)
            .fill(0)
            .map((_, i) => `feature-flag-${i + 1}`);

        const conflicts = [{ id: 5, title: 'crTitle' }, { id: 6 }];
        setupFlagScheduleConflicts(conflicts);

        render(
            <FeatureArchiveDialog
                featureIds={featureIds}
                projectId={'projectId'}
                isOpen={true}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
                featuresWithUsage={[]}
            />,
        );

        const links = await screen.findAllByRole('link');
        expect(links).toHaveLength(2);
        expect(links[0]).toHaveTextContent('#5 (crTitle)');
        expect(links[0]).toHaveAccessibleDescription('Change request 5');
        expect(links[1]).toHaveTextContent('Change request #6');
        expect(links[1]).toHaveAccessibleDescription('Change request 6');

        const alerts = await screen.findAllByRole('alert');
        expect(alerts).toHaveLength(2);
        expect(alerts[1]).toHaveTextContent(
            'This archive operation would conflict with 2 scheduled change request(s).',
        );
    });
});
