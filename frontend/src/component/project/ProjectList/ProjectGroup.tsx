import type { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ProjectCard as DefaultProjectCard } from '../ProjectCard/ProjectCard.tsx';
import type { ProjectSchema } from 'openapi';
import { loadingData } from './loadingData.ts';
import { styled } from '@mui/material';
import { UpgradeProjectCard } from '../ProjectCard/UpgradeProjectCard.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { ProjectsListView } from './hooks/useProjectsListState.ts';
import { ProjectsListTable } from './ProjectsListTable/ProjectsListTable.tsx';

const StyledGridContainer = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: theme.spacing(2),
}));

const StyledCardLink = styled(Link)(({ theme }) => ({
    color: 'inherit',
    textDecoration: 'none',
    border: 'none',
    padding: '0',
    background: 'transparent',
    fontFamily: theme.typography.fontFamily,
    pointer: 'cursor',
}));

type ProjectGroupProps = {
    sectionTitle?: string;
    sectionSubtitle?: string;
    HeaderActions?: ReactNode;
    projects: ProjectSchema[];
    loading: boolean;
    placeholder?: string;
    ProjectCardComponent?: ComponentType<ProjectSchema & any>;
    link?: boolean;
    view?: ProjectsListView;
};

export const ProjectGroup = ({
    projects,
    loading,
    ProjectCardComponent,
    link = true,
    view = 'cards',
}: ProjectGroupProps) => {
    const ProjectCard = ProjectCardComponent ?? DefaultProjectCard;
    const { isOss } = useUiConfig();

    const projectsToRender = loading ? loadingData : projects;

    if (!isOss() && view === 'list') {
        return <ProjectsListTable projects={projectsToRender} />;
    }

    return (
        <StyledGridContainer>
            {projectsToRender.map((project) =>
                link ? (
                    <StyledCardLink
                        key={project.id}
                        to={`/projects/${project.id}`}
                    >
                        <ProjectCard data-loading {...project} />
                    </StyledCardLink>
                ) : (
                    <ProjectCard data-loading key={project.id} {...project} />
                ),
            )}
            {isOss() ? <UpgradeProjectCard /> : null}
        </StyledGridContainer>
    );
};
