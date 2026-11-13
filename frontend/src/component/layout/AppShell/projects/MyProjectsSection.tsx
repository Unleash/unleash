import type { FC } from 'react';
import { styled } from '@mui/material';
import { Link } from 'react-router';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import { useMyProjects } from 'component/project/ProjectList/hooks/useMyProjects';
import { sidebarItemStyles } from '../sidebar/SidebarItem.styles.ts';
import { SidebarSection } from '../sidebar/SidebarSection.tsx';
import {
    ProjectNavGroup,
    type ProjectNavExpansion,
} from './ProjectNavGroup.tsx';

const StyledEmptyLink = styled(Link)(({ theme }) => ({
    ...sidebarItemStyles(theme),
    color: theme.palette.text.secondary,
}));

export const MyProjectsSection: FC = () => {
    const { projects, loading, error } = useProjects();
    const { myProjects, profileLoading, profileError } =
        useMyProjects(projects);
    const [expansion, setExpansion] = useLocalStorageState<
        Record<string, ProjectNavExpansion>
    >('app-shell:project-expansion', {});

    if (loading || profileLoading || error || profileError) {
        return null;
    }

    return (
        <SidebarSection title='My projects'>
            {myProjects.length === 0 ? (
                <StyledEmptyLink to='/projects'>
                    Favorite a project to see it here
                </StyledEmptyLink>
            ) : (
                myProjects.map((project) => (
                    <ProjectNavGroup
                        key={project.id}
                        project={project}
                        expansion={expansion[project.id]}
                        onExpansionChange={(change) =>
                            setExpansion((previous) => ({
                                ...previous,
                                [project.id]: {
                                    ...previous[project.id],
                                    ...change,
                                },
                            }))
                        }
                    />
                ))
            )}
        </SidebarSection>
    );
};
