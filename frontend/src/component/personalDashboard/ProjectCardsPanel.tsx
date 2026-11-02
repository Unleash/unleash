import { useCallback, useState } from 'react';
import { flushSync } from 'react-dom';
import { Link } from 'react-router';
import { Button, styled, Typography } from '@mui/material';
import { usePersonalDashboard } from 'hooks/api/getters/usePersonalDashboard/usePersonalDashboard';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import useLoading from 'hooks/useLoading';
import { useEventTracker } from 'hooks/useEventTracker';
import type { ProjectSchema } from 'openapi';
import { ProjectCard } from 'component/project/ProjectCard/ProjectCard';
import { ProjectCreationButton } from 'component/project/ProjectList/ProjectCreationButton/ProjectCreationButton';
import { loadingData } from 'component/project/ProjectList/loadingData';
import { TablePlaceholder } from 'component/common/Table/TablePlaceholder/TablePlaceholder';
import type { RemoteData } from './RemoteData.ts';

const Panel = styled('section')(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 4, 3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const PanelHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(2),
}));

const PanelTitle = styled('h3')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    margin: 0,
}));

const CardGrid = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${theme.spacing(35)}, 1fr))`,
    gap: theme.spacing(2),
}));

const useCardsPerRow = () => {
    const [cardsPerRow, setCardsPerRow] = useState(1);

    const gridRef = useCallback((grid: HTMLDivElement | null) => {
        if (!grid) {
            return;
        }
        // The computed value lists the resolved column tracks, e.g. "304px 304px 304px"
        const update = () =>
            setCardsPerRow(
                getComputedStyle(grid).gridTemplateColumns.split(' ').length,
            );
        update();
        // Render before paint, otherwise cards that no longer fit flash as a wrapped second row
        const observer = new ResizeObserver(() => flushSync(update));
        observer.observe(grid);
        return () => observer.disconnect();
    }, []);

    return { gridRef, cardsPerRow };
};

const CardLink = styled(Link)({
    color: 'inherit',
    textDecoration: 'none',
});

const EmptyStateContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
    color: theme.palette.text.secondary,
}));

const MoreProjectsLink = styled(Link)(({ theme }) => ({
    alignSelf: 'flex-start',
    fontWeight: theme.typography.fontWeightBold,
}));

type ProjectCardsPanelViewProps = {
    projects: RemoteData<ProjectSchema[]>;
    onProjectClick: () => void;
};

export const ProjectCardsPanelView = ({
    projects,
    onProjectClick,
}: ProjectCardsPanelViewProps) => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const ref = useLoading(projects.state === 'loading');
    const { gridRef, cardsPerRow } = useCardsPerRow();

    const loadedProjects = projects.state === 'success' ? projects.data : [];
    const visibleProjects = (
        projects.state === 'loading' ? loadingData : loadedProjects
    ).slice(0, cardsPerRow);
    const hiddenCount = loadedProjects.length - cardsPerRow;

    return (
        <Panel ref={ref} aria-labelledby='projects-panel-header'>
            <PanelHeader>
                <PanelTitle id='projects-panel-header'>My projects</PanelTitle>
                <ProjectCreationButton
                    isDialogOpen={isCreateDialogOpen}
                    setIsDialogOpen={setIsCreateDialogOpen}
                />
            </PanelHeader>
            {projects.state === 'error' || visibleProjects.length === 0 ? (
                <TablePlaceholder>
                    <EmptyStateContent>
                        <Typography>
                            {projects.state === 'error'
                                ? "We couldn't load your projects."
                                : 'You are not a member of any projects yet.'}
                        </Typography>
                        <Button
                            variant='contained'
                            component={Link}
                            nativeButton={false}
                            to='/projects'
                        >
                            View projects
                        </Button>
                    </EmptyStateContent>
                </TablePlaceholder>
            ) : (
                <CardGrid ref={gridRef}>
                    {visibleProjects.map((project) => (
                        <CardLink
                            key={project.id}
                            to={`/projects/${project.id}`}
                            onClick={(event) => {
                                // The favorite star inside the card prevents navigation
                                if (!event.defaultPrevented) {
                                    onProjectClick();
                                }
                            }}
                        >
                            <ProjectCard {...project} />
                        </CardLink>
                    ))}
                </CardGrid>
            )}
            {hiddenCount > 0 && (
                <MoreProjectsLink to='/projects'>
                    View {hiddenCount} more
                </MoreProjectsLink>
            )}
        </Panel>
    );
};

export const ProjectCardsPanel = () => {
    const {
        personalDashboard,
        loading: dashboardLoading,
        error: dashboardError,
    } = usePersonalDashboard();
    const {
        projects: allProjects,
        loading: projectsLoading,
        error: projectsError,
    } = useProjects();
    const { trackEvent } = useEventTracker();

    const projectsById = new Map(allProjects.map((p) => [p.id, p]));
    const myProjects = (personalDashboard?.projects ?? [])
        .map(({ id }) => projectsById.get(id))
        .filter((project): project is ProjectSchema => Boolean(project));

    const error = dashboardError ?? projectsError;
    const projects: RemoteData<ProjectSchema[]> = error
        ? { state: 'error', error }
        : dashboardLoading || projectsLoading
          ? { state: 'loading' }
          : { state: 'success', data: myProjects };

    return (
        <ProjectCardsPanelView
            projects={projects}
            onProjectClick={() =>
                trackEvent('personal-dashboard', {
                    props: {
                        eventType: 'Go to project from list',
                        dashboardVersion: 'v2',
                    },
                })
            }
        />
    );
};
