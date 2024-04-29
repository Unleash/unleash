import { Link } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ProjectCard as LegacyProjectCard } from '../ProjectCard/ProjectCard';
import { ProjectCard as NewProjectCard } from '../NewProjectCard/NewProjectCard';
import type { IProjectCard } from 'interfaces/project';
import loadingData from './loadingData';
import { TablePlaceholder } from 'component/common/Table';
import { styled, Typography } from '@mui/material';
import { useUiFlag } from 'hooks/useUiFlag';

/**
 * @deprecated Remove after with `projectsListNewCards` flag
 */
const StyledDivContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    [theme.breakpoints.down('sm')]: {
        justifyContent: 'center',
    },
}));

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
    handleHover: (id: string) => void;
}> = ({ sectionTitle, projects, loading, searchValue, handleHover }) => {
    const useNewProjectCards = useUiFlag('projectsListNewCards');

    const [StyledItemsContainer, ProjectCard] = useNewProjectCards
        ? [StyledGridContainer, NewProjectCard]
        : [StyledDivContainer, LegacyProjectCard];

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
                            <TablePlaceholder>
                                No projects available.
                            </TablePlaceholder>
                        }
                    />
                }
                elseShow={
                    <StyledItemsContainer>
                        <ConditionallyRender
                            condition={loading}
                            show={() =>
                                loadingData.map((project: IProjectCard) => (
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
                                ))
                            }
                            elseShow={() => (
                                <>
                                    {projects.map((project: IProjectCard) => (
                                        <StyledCardLink
                                            key={project.id}
                                            to={`/projects/${project.id}`}
                                        >
                                            <ProjectCard
                                                onHover={() =>
                                                    handleHover(project.id)
                                                }
                                                name={project.name}
                                                mode={project.mode}
                                                memberCount={
                                                    project.memberCount ?? 0
                                                }
                                                health={project.health}
                                                id={project.id}
                                                featureCount={
                                                    project.featureCount
                                                }
                                                isFavorite={project.favorite}
                                                owners={project.owners}
                                            />
                                        </StyledCardLink>
                                    ))}
                                </>
                            )}
                        />
                    </StyledItemsContainer>
                }
            />
        </div>
    );
};
