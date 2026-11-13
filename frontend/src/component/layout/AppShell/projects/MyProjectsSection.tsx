import type { FC } from 'react';
import { styled } from '@mui/material';
import { Link } from 'react-router';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useMyProjects } from 'component/project/ProjectList/hooks/useMyProjects';
import { sidebarItemStyles } from '../sidebar/SidebarItem.styles.ts';
import { SidebarLink } from '../sidebar/SidebarLink.tsx';
import { SidebarSection } from '../sidebar/SidebarSection.tsx';

const StyledEmptyLink = styled(Link)(({ theme }) => ({
    ...sidebarItemStyles(theme),
    color: theme.palette.text.secondary,
}));

export const MyProjectsSection: FC = () => {
    const { projects, loading, error } = useProjects();
    const { myProjects, profileLoading, profileError } =
        useMyProjects(projects);

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
                    <SidebarLink
                        key={project.id}
                        to={`/projects/${project.id}`}
                        icon={<FolderOutlinedIcon />}
                        label={project.name}
                    />
                ))
            )}
        </SidebarSection>
    );
};
