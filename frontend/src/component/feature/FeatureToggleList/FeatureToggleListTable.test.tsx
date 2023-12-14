import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FeatureToggleListTable } from './FeatureToggleListTable';

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

type UIFeature = {
    name: string;
    segments: string;
    tags: string;
    createdAt: string;
    project: string;
    state: string;
};

const server = testServerSetup();

const setupNoFeaturesReturned = () =>
    testServerRoute(server, '/api/admin/search/features', {
        features: [],
    });

const setupApi = (features: APIFeature[], projects: APIProject[]) => {
    testServerRoute(server, '/api/admin/ui-config', {});

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

const verifyTableFeature = async (feature: UIFeature) => {
    await screen.findByText('Feature toggles');
    await screen.findByText('Add Filter');
    Object.values(feature).forEach((value) => {
        expect(screen.getByText(value)).toBeInTheDocument();
    });
};

const filterFeaturesByProject = async (projectName: string) => {
    const addFilterButton = screen.getByText('Add Filter');
    addFilterButton.click();

    const projectItem = await screen.findByText('Project');
    projectItem.click();

    await screen.findByPlaceholderText('Search');
    const anotherProjectCheckbox = await screen.findByText(projectName);

    anotherProjectCheckbox.click();
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
    render(<FeatureToggleListTable />);

    await verifyTableFeature({
        name: 'Operational Feature',
        createdAt: '11/03/2023',
        segments: '1 segment',
        tags: '1 tag',
        project: 'project-a',
        state: 'Active',
    });

    setupNoFeaturesReturned();
    await filterFeaturesByProject('Project B');

    await screen.findByText(
        'No feature toggles available. Get started by adding a new feature toggle.',
    );
    expect(window.location.href).toContain(
        '?offset=0&columns=&project=IS%3Aproject-b',
    );
});
