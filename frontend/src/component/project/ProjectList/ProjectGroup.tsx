import type { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ProjectCard as DefaultProjectCard } from '../ProjectCard/ProjectCard.tsx';
import type { ProjectSchema } from 'openapi';
import loadingData from './loadingData.ts';
import { styled } from '@mui/material';
import { UpgradeProjectCard } from '../ProjectCard/UpgradeProjectCard.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

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
};

export const ProjectGroup = ({
    projects,
    loading,
    ProjectCardComponent,
    link = true,
}: ProjectGroupProps) => {
    const ProjectCard = ProjectCardComponent ?? DefaultProjectCard;
    const { isOss } = useUiConfig();

    return (
        <StyledGridContainer>
            <ConditionallyRender
                condition={loading}
                show={() => (
                    <>
                        {loadingData.map((project: ProjectSchema) => (
                            <ProjectCard
                                data-loading
                                createdAt={project.createdAt}
                                key={project.id}
                                name={project.name}
                                id={project.id}
                                mode={project.mode}
                                memberCount={2}
                                health={95}
                                featureCount={4}
                                owners={[
                                    {
                                        ownerType: 'user',
                                        name: 'Loading data',
                                    },
                                ]}
                            />
                        ))}
                    </>
                )}
                elseShow={() => (
                    <>
                        {projects.map((project) =>
                            link ? (
                                <StyledCardLink
                                    key={project.id}
                                    to={`/projects/${project.id}`}
                                >
                                    <ProjectCard {...project} />
                                </StyledCardLink>
                            ) : (
                                <ProjectCard key={project.id} {...project} />
                            ),
                        )}
                    </>
                )}
            />
            {isOss() ? <UpgradeProjectCard /> : null}
        </StyledGridContainer>
    );
};
