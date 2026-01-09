import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FeatureToggleListTable } from './FeatureToggleListTable.tsx';
import { FeedbackProvider } from '../../feedbackNew/FeedbackProvider.tsx';

type APIFeature = {
    name: string;
    segments: string[];
    tags: { type: string; value: string }[];
    createdAt: string;
    project: string;
    stale: boolean;
};

type APIProject = {
    name: string;
    id: string;
};

const server = testServerSetup();

const setupNoFeaturesReturned = () =>
    testServerRoute(server, '/api/admin/search/features', {
        features: [],
    });

const setupApi = (features: APIFeature[], projects: APIProject[]) => {
    testServerRoute(server, '/api/admin/projects', {
        projects,
    });

    testServerRoute(server, '/api/admin/environments', {
        environments: [
            {
                name: 'development',
                enabled: true,
            },
            {
                name: 'production',
                enabled: true,
            },
        ],
    });

    testServerRoute(server, '/api/admin/segments', {});

    testServerRoute(server, '/api/admin/tags', {});

    testServerRoute(server, '/api/admin/feature-types', {});

    testServerRoute(server, '/api/admin/search/features', {
        features: features.map((feature) => ({
            type: 'experiment',
            project: feature.project,
            favorite: false,
            name: feature.name,
            createdAt: feature.createdAt,
            stale: feature.stale,
            lastSeenAt: null,
            environments: [],
            segments: feature.segments,
            tags: feature.tags,
        })),
    });
};

test('Filter table by project', async () => {
    setupApi(
        [
            {
                name: 'Operational Feature',
                createdAt: '2023-11-03T10:19:37.978Z',
                stale: false,
                project: 'project-a',
                tags: [{ type: 'simple', value: 'new' }],
                segments: ['project segment'],
            },
        ],
        [
            {
                name: 'Project A',
                id: 'project-a',
            },
            {
                name: 'Project B',
                id: 'project-b',
            },
        ],
    );
    render(
        <FeedbackProvider>
            <FeatureToggleListTable />
        </FeedbackProvider>,
    );

    await screen.findByPlaceholderText(/Search/);
    await screen.getByRole('button', {
        name: 'Add Filter',
    });

    await Promise.all(
        Object.values({
            name: 'Operational Feature',
            createdAt: '11/03/2023',
            project: 'project-a',
        }).map((value) => screen.findByText(value)),
    );

    setupNoFeaturesReturned();

    const addFilterButton = screen.getByText('Add Filter');
    addFilterButton.click();

    const projectItem = await screen.findByRole('menuitem', {
        name: 'Project',
    });
    fireEvent.click(projectItem);

    await screen.findByPlaceholderText('Search');
    const anotherProjectCheckbox = await screen.findByText('Project B');

    anotherProjectCheckbox.click();

    await screen.findByText('No feature flags found matching your criteria.');
    expect(window.location.href).toContain(
        '?offset=0&columns=&project=IS%3Aproject-b',
    );
}, 10000);
