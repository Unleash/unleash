import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ProjectCard } from '../NewProjectCard/NewProjectCard';

import type { IProjectCard } from 'interfaces/project';
import loadingData from './loadingData';
import { TablePlaceholder } from 'component/common/Table';
import { styled, Typography } from '@mui/material';

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

type ProjectGroupProps<T extends { id: string } = IProjectCard> = {
    sectionTitle?: string;
    projects: T[];
    loading: boolean;
    searchValue: string;
    placeholder?: string;
    ProjectCardComponent?: ComponentType<T & any>;
    link?: boolean;
};

export const ProjectGroup = <T extends { id: string }>({
    sectionTitle,
    projects,
    loading,
    searchValue,
    placeholder = 'No projects available.',
    ProjectCardComponent = ProjectCard,
    link = true,
}: ProjectGroupProps<T>) => {
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
                        condition={searchValue?.length > 0}
                        show={
                            <TablePlaceholder>
                                No projects found matching &ldquo;
                                {searchValue}
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
                                                onHover={() => {}}
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
                                    {projects.map((project: T) =>
                                        link ? (
                                            <StyledCardLink
                                                key={project.id}
                                                to={`/projects/${project.id}`}
                                            >
                                                <ProjectCardComponent
                                                    onHover={() => {}}
                                                    {...project}
                                                />
                                            </StyledCardLink>
                                        ) : (
                                            <ProjectCardComponent
                                                key={project.id}
                                                onHover={() => {}}
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
