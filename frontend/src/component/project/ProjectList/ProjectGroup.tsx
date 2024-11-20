import type { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ProjectCard as DefaultProjectCard } from '../ProjectCard/ProjectCard';
import type { ProjectSchema } from 'openapi';
import loadingData from './loadingData';
import { TablePlaceholder } from 'component/common/Table';
import { styled } from '@mui/material';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { UpgradeProjectCard } from '../ProjectCard/UpgradeProjectCard';
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
    placeholder = 'No projects available.',
    ProjectCardComponent,
    link = true,
}: ProjectGroupProps) => {
    const ProjectCard = ProjectCardComponent ?? DefaultProjectCard;
    const { isOss } = useUiConfig();
    const { searchQuery } = useSearchHighlightContext();

    return (
        <>
            <ConditionallyRender
                condition={projects.length < 1 && !loading}
                show={
                    <ConditionallyRender
                        condition={searchQuery?.length > 0}
                        show={
                            <TablePlaceholder>
                                No projects found matching &ldquo;
                                {searchQuery}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>{placeholder}</TablePlaceholder>
                        }
                    />
                }
                elseShow={
                    <StyledGridContainer>
                        <ConditionallyRender
                            condition={loading}
                            show={() => (
                                <>
                                    {loadingData.map(
                                        (project: ProjectSchema) => (
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
                                        ),
                                    )}
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
                                            <ProjectCard
                                                key={project.id}
                                                {...project}
                                            />
                                        ),
                                    )}
                                </>
                            )}
                        />
                        {isOss() ? <UpgradeProjectCard /> : null}
                    </StyledGridContainer>
                }
            />
        </>
    );
};
