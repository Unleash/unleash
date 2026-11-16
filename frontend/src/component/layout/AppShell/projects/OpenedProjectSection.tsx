import type { FC } from 'react';
import { matchPath, useLocation } from 'react-router';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useMyProjects } from 'component/project/ProjectList/hooks/useMyProjects';
import { useSessionStorageState } from 'hooks/useSessionStorageState';
import { SidebarSection } from '../sidebar/SidebarSection.tsx';
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

    return (
        <SidebarSection title='Opened projects'>
            <ProjectNavGroup
                project={project}
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
