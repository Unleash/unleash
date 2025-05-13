import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { createFeatureOverviewCell } from './FeatureOverviewCell.tsx';

const noOp = () => {};

test('Display full overview information', () => {
    const FeatureOverviewCell = createFeatureOverviewCell(noOp, noOp);

    render(
        <FeatureOverviewCell
            row={{
                original: {
                    name: 'my_feature',
                    tags: [
                        { type: 'simple', value: 'value1' },
                        { type: 'simple', value: 'value2' },
                        { type: 'simple', value: 'value3' },
                        { type: 'simple', value: 'value4' },
                    ],
                    description: 'My description',
                    type: 'release',
                    dependencyType: 'child',
                    project: 'my_project',
                    archivedAt: null,
                },
            }}
        />,
    );

    expect(screen.getByText('my_feature')).toBeInTheDocument();
    expect(screen.getByText('My description')).toBeInTheDocument();
    expect(screen.getByText('child')).toBeInTheDocument();
    expect(screen.getByText('simple:value1')).toBeInTheDocument();
    expect(screen.getByText('simple:value2')).toBeInTheDocument();
    expect(screen.getByText('simple:value3')).toBeInTheDocument();
    expect(screen.getByText('1 more...')).toBeInTheDocument();
    expect(screen.queryByText('simple:value4')).not.toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        '/projects/my_project/features/my_feature',
    );
});

test('Display minimal overview information', () => {
    const FeatureOverviewCell = createFeatureOverviewCell(noOp, noOp);

    render(
        <FeatureOverviewCell
            row={{
                original: {
                    name: 'my_feature',
                    tags: [],
                    description: '',
                    type: '',
                    dependencyType: null,
                    project: 'my_project',
                    archivedAt: null,
                },
            }}
        />,
    );

    expect(screen.getByText('my_feature')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        '/projects/my_project/features/my_feature',
    );
});

test('show archived information', () => {
    const FeatureOverviewCell = createFeatureOverviewCell(noOp, noOp);

    render(
        <FeatureOverviewCell
            row={{
                original: {
                    name: 'archived_feature',
                    tags: [],
                    description: '',
                    type: '',
                    dependencyType: null,
                    project: 'my_project',
                    archivedAt: '2024-11-09',
                },
            }}
        />,
    );

    expect(screen.getByText('archived_feature')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toBeInTheDocument();
});
