import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ProjectCard as LegacyProjectCard } from '../ProjectCard/LegacyProjectCard';
import { ProjectCard as NewProjectCard } from '../ProjectCard/ProjectCard';

import type { IProjectCard } from 'interfaces/project';
import loadingData from './loadingData';
import { TablePlaceholder } from 'component/common/Table';
import { styled, Typography } from '@mui/material';
import { useUiFlag } from 'hooks/useUiFlag';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';

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
    projects: IProjectCard[];
    loading: boolean;
    /**
     * @deprecated remove with projectListImprovements
     */
    searchValue?: string;
    placeholder?: string;
    ProjectCardComponent?: ComponentType<IProjectCard & any>;
    link?: boolean;
};

export const ProjectGroup = ({
    sectionTitle,
    projects,
    loading,
    searchValue,
    placeholder = 'No projects available.',
    ProjectCardComponent,
    link = true,
}: ProjectGroupProps) => {
    const projectListImprovementsEnabled = useUiFlag('projectListImprovements');
    const ProjectCard =
        ProjectCardComponent ??
        (projectListImprovementsEnabled ? NewProjectCard : LegacyProjectCard);
    const { searchQuery } = useSearchHighlightContext();

    return (
        <article>
            <ConditionallyRender
                condition={Boolean(sectionTitle)}
                show={
                    <Typography
                        component='h2'
                        variant='h3'
                        sx={(theme) => ({ marginBottom: theme.spacing(2) })}
                    >
                        {sectionTitle}
                    </Typography>
                }
            />
            <ConditionallyRender
                condition={projects.length < 1 && !loading}
                show={
                    <ConditionallyRender
                        condition={(searchValue || searchQuery)?.length > 0}
                        show={
                            <TablePlaceholder>
                                No projects found matching &ldquo;
                                {searchValue || searchQuery}
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
                                        (project: IProjectCard) => (
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
                    </StyledGridContainer>
                }
            />
        </article>
    );
};
