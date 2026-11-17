import type { FC } from 'react';
import { matchPath, useLocation } from 'react-router';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloseIcon from '@mui/icons-material/Close';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useMyProjects } from 'component/project/ProjectList/hooks/useMyProjects';
import { useSessionStorageState } from 'hooks/useSessionStorageState';
import { useFavoriteProjectsApi } from 'hooks/api/actions/useFavoriteProjectsApi/useFavoriteProjectsApi';
import { SidebarSection } from '../sidebar/SidebarSection.tsx';
import { SidebarRowAction } from '../sidebar/SidebarRowAction.tsx';
import {
    ProjectNavGroup,
    type ProjectNavExpansion,
} from './ProjectNavGroup.tsx';

const useCurrentProjectId = () => {
    const { pathname } = useLocation();
    return matchPath('/projects/:projectId/*', pathname)?.params.projectId;
};

type OpenedProject = { id: string; expansion: ProjectNavExpansion };

export const OpenedProjectSection: FC = () => {
    const currentProjectId = useCurrentProjectId();
    const { projects } = useProjects();
    const { favorite } = useFavoriteProjectsApi();
    const { myProjects, profileLoading, profileError } =
        useMyProjects(projects);
    // Some routes render without the sidebar, so the opened project has to
    // outlive this component. Session storage, not local storage, because it
    // should only be preserved within a single session.
    const [openedProject, setOpenedProject] = useSessionStorageState<
        OpenedProject | undefined
    >('app-shell:opened-project', undefined);

    const isMine = (projectId: string) =>
        myProjects.some(({ id }) => id === projectId);
    // Checked against the project list so pages like /projects/create don't
    // replace the opened project.
    const currentIsNewlyOpened =
        currentProjectId !== undefined &&
        currentProjectId !== openedProject?.id &&
        projects.some(({ id }) => id === currentProjectId) &&
        !isMine(currentProjectId);

    if (currentIsNewlyOpened) {
        setOpenedProject({ id: currentProjectId, expansion: {} });
    }

    const project = projects.find(({ id }) => id === openedProject?.id);

    if (
        profileLoading ||
        profileError ||
        !openedProject ||
        !project ||
        isMine(project.id)
    ) {
        return null;
    }

    // Removing the current project would only open it again straight away.
    const action =
        project.id === currentProjectId ? (
            <SidebarRowAction
                tooltip='Add to favorites'
                label={`Add ${project.name} to favorites`}
                icon={<StarBorderIcon />}
                onClick={() => favorite(project.id)}
            />
        ) : (
            <SidebarRowAction
                tooltip='Remove from sidebar'
                label={`Remove ${project.name} from sidebar`}
                icon={<CloseIcon />}
                onClick={() => setOpenedProject(undefined)}
            />
        );

    return (
        <SidebarSection title='Opened projects'>
            <ProjectNavGroup
                project={project}
                muteWhenNotCurrent
                action={action}
                expansion={openedProject.expansion}
                onExpansionChange={(change) =>
                    setOpenedProject(
                        (previous) =>
                            previous && {
                                ...previous,
                                expansion: { ...previous.expansion, ...change },
                            },
                    )
                }
            />
        </SidebarSection>
    );
};
