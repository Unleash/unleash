import { Link } from 'react-router-dom';
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

export const ProjectGroup: React.FC<{
    sectionTitle?: string;
    projects: IProjectCard[];
    loading: boolean;
    searchValue: string;
}> = ({ sectionTitle, projects, loading, searchValue }) => {
    return (
        <article>
            {sectionTitle ? (
                <Typography
                    component='h2'
                    variant='h3'
                    sx={(theme) => ({ marginBottom: theme.spacing(2) })}
                >
                    {sectionTitle}
                </Typography>
            ) : null}
            {projects.length < 1 && !loading ? (
                searchValue?.length > 0 ? (
                    <TablePlaceholder>
                        No projects found matching &ldquo;
                        {searchValue}
                        &rdquo;
                    </TablePlaceholder>
                ) : (
                    <TablePlaceholder>No projects available.</TablePlaceholder>
                )
            ) : (
                <StyledGridContainer>
                    {loading ? (
                        <>
                            {loadingData.map((project: IProjectCard) => (
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
                            ))}
                        </>
                    ) : (
                        <>
                            {projects.map((project: IProjectCard) => (
                                <StyledCardLink
                                    key={project.id}
                                    to={`/projects/${project.id}`}
                                >
                                    <ProjectCard
                                        onHover={() => {}}
                                        name={project.name}
                                        mode={project.mode}
                                        memberCount={project.memberCount ?? 0}
                                        health={project.health}
                                        id={project.id}
                                        featureCount={project.featureCount}
                                        isFavorite={project.favorite}
                                        owners={project.owners}
                                    />
                                </StyledCardLink>
                            ))}
                        </>
                    )}
                </StyledGridContainer>
            )}
        </article>
    );
};
