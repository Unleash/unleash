import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router';
import { Paper, Typography } from '@mui/material';
import useLoading from 'hooks/useLoading';
import useToast from 'hooks/useToast';
import useQueryParams from 'hooks/useQueryParams';
import ProjectFlags from './ProjectFlags.tsx';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { DeleteProjectDialogue } from './DeleteProject/DeleteProjectDialogue.tsx';
import { ProjectLog } from './ProjectLog/ProjectLog.tsx';
import { ChangeRequestOverview } from 'component/changeRequest/ChangeRequestOverview/ChangeRequestOverview';
import { ProjectChangeRequests } from '../../changeRequest/ProjectChangeRequests/ProjectChangeRequests.tsx';
import { ProjectSettings } from './ProjectSettings/ProjectSettings.tsx';
import { ImportModal } from './Import/ImportModal.tsx';
import { ProjectApplications } from '../ProjectApplications/ProjectApplications.tsx';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { ProjectArchived } from './ArchiveProject/ProjectArchived.tsx';
import { deleteProjectTracking } from 'component/project/projectTracking';
import { useUiFlag } from 'hooks/useUiFlag';
import { ProjectHeader } from './ProjectHeader/ProjectHeader.tsx';

export const Project = () => {
    const projectId = useRequiredPathParam('projectId');
    const params = useQueryParams();
    const { project, loading, error } = useProjectOverview(projectId);
    const ref = useLoading(loading, '[data-loading-project=true]');
    const { setToastData } = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();
    const improvedSidebarNavigation = useUiFlag('improvedSidebarNavigation');

    const [showDelDialog, setShowDelDialog] = useState(false);

    useEffect(() => {
        const created = params.get('created');
        const edited = params.get('edited');

        if (created || edited) {
            const text = created ? 'Project created' : 'Project updated';
            setToastData({
                type: 'success',
                text,
            });
        }
        /* eslint-disable-next-line */
    }, []);

    if (error?.status === 404) {
        return (
            <Paper sx={(theme) => ({ padding: theme.spacing(2, 4, 4) })}>
                <Typography variant='h1'>404 Not Found</Typography>
                <Typography>
                    Project <strong>{projectId}</strong> does not exist.
                </Typography>
            </Paper>
        );
    }

    if (project.archivedAt) {
        return <ProjectArchived name={project.name} />;
    }

    return (
        <div ref={ref}>
            {!improvedSidebarNavigation && <ProjectHeader />}
            <DeleteProjectDialogue
                projectId={projectId}
                open={showDelDialog}
                tracking={deleteProjectTracking}
                onClose={() => {
                    setShowDelDialog(false);
                }}
                onSuccess={() => {
                    navigate('/projects');
                }}
            />
            <Routes>
                <Route
                    path='access/*'
                    element={
                        <Navigate
                            replace
                            to={`/projects/${projectId}/settings/access`}
                        />
                    }
                />
                <Route path='logs' element={<ProjectLog />} />
                <Route
                    path='change-requests'
                    element={<ProjectChangeRequests />}
                />
                <Route
                    path='change-requests/:id'
                    element={<ChangeRequestOverview />}
                />
                <Route path='settings/*' element={<ProjectSettings />} />
                <Route path='applications' element={<ProjectApplications />} />
                <Route path='*' element={<ProjectFlags />} />
            </Routes>
            <ImportModal
                open={modalOpen}
                setOpen={setModalOpen}
                project={projectId}
            />
        </div>
    );
};
