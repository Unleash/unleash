import { useNavigate } from 'react-router';
import useProject from 'hooks/api/getters/useProject/useProject';
import useLoading from 'hooks/useLoading';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    StyledDiv,
    StyledFavoriteIconButton,
    StyledHeader,
    StyledInnerContainer,
    StyledName,
    StyledProjectTitle,
    StyledSeparator,
    StyledTab,
    StyledTabContainer,
    StyledTopRow,
} from './Project.styles';
import { Paper, Tabs, Typography } from '@mui/material';
import { Delete, Edit, FileUpload } from '@mui/icons-material';
import useToast from 'hooks/useToast';
import useQueryParams from 'hooks/useQueryParams';
import { useEffect, useState } from 'react';
import ProjectEnvironment from '../ProjectEnvironment/ProjectEnvironment';
import { ProjectFeaturesArchive } from './ProjectFeaturesArchive/ProjectFeaturesArchive';
import ProjectOverview from './ProjectOverview';
import ProjectHealth from './ProjectHealth/ProjectHealth';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import {
    UPDATE_FEATURE,
    DELETE_PROJECT,
    UPDATE_PROJECT,
} from 'component/providers/AccessProvider/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { DeleteProjectDialogue } from './DeleteProject/DeleteProjectDialogue';
import { ProjectLog } from './ProjectLog/ProjectLog';
import { ChangeRequestOverview } from 'component/changeRequest/ChangeRequestOverview/ChangeRequestOverview';
import { ProjectChangeRequests } from '../../changeRequest/ProjectChangeRequests/ProjectChangeRequests';
import { ProjectSettings } from './ProjectSettings/ProjectSettings';
import { useFavoriteProjectsApi } from 'hooks/api/actions/useFavoriteProjectsApi/useFavoriteProjectsApi';
import { ImportModal } from './Import/ImportModal';
import { IMPORT_BUTTON } from 'utils/testIds';

const NAVIGATE_TO_EDIT_PROJECT = 'NAVIGATE_TO_EDIT_PROJECT';

export const Project = () => {
    const projectId = useRequiredPathParam('projectId');
    const params = useQueryParams();
    const { project, loading, error, refetch } = useProject(projectId);
    const ref = useLoading(loading);
    const { setToastData } = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { isOss, uiConfig } = useUiConfig();
    const basePath = `/projects/${projectId}`;
    const projectName = project?.name || projectId;
    const { favorite, unfavorite } = useFavoriteProjectsApi();

    const [showDelDialog, setShowDelDialog] = useState(false);

    const tabs = [
        {
            title: 'Overview',
            path: basePath,
            name: 'overview',
        },
        {
            title: 'Health',
            path: `${basePath}/health`,
            name: 'health',
        },
        {
            title: 'Archive',
            path: `${basePath}/archive`,
            name: 'archive',
        },
        {
            title: 'Change requests',
            path: `${basePath}/change-requests`,
            name: 'change-request',
        },
        {
            title: 'Project settings',
            path: `${basePath}/settings`,
            name: 'settings',
        },
        {
            title: 'Event log',
            path: `${basePath}/logs`,
            name: 'logs',
        },
    ];

    const activeTab = [...tabs]
        .reverse()
        .find(tab => pathname.startsWith(tab.path));

    useEffect(() => {
        const created = params.get('created');
        const edited = params.get('edited');

        if (created || edited) {
            const text = created ? 'Project created' : 'Project updated';
            setToastData({
                type: 'success',
                title: text,
            });
        }
        /* eslint-disable-next-line */
    }, []);

    if (error?.status === 404) {
        return (
            <Paper sx={theme => ({ padding: theme.spacing(2, 4, 4) })}>
                <Typography variant="h1">404 Not Found</Typography>
                <Typography>
                    Project <strong>{projectId}</strong> does not exist.
                </Typography>
            </Paper>
        );
    }

    const onFavorite = async () => {
        if (project?.favorite) {
            await unfavorite(projectId);
        } else {
            await favorite(projectId);
        }
        refetch();
    };

    return (
        <div ref={ref}>
            <StyledHeader>
                <StyledInnerContainer>
                    <StyledTopRow>
                        <StyledDiv>
                            <StyledFavoriteIconButton
                                onClick={onFavorite}
                                isFavorite={project?.favorite}
                            />
                            <StyledProjectTitle>
                                <StyledName data-loading>
                                    {projectName}
                                </StyledName>
                            </StyledProjectTitle>
                        </StyledDiv>
                        <StyledDiv>
                            <ConditionallyRender
                                condition={Boolean(
                                    uiConfig?.flags?.featuresExportImport
                                )}
                                show={
                                    <PermissionIconButton
                                        permission={UPDATE_FEATURE}
                                        projectId={projectId}
                                        onClick={() => setModalOpen(true)}
                                        tooltipProps={{ title: 'Import' }}
                                        data-testid={IMPORT_BUTTON}
                                        data-loading
                                    >
                                        <FileUpload />
                                    </PermissionIconButton>
                                }
                            />
                            <ConditionallyRender
                                condition={!isOss()}
                                show={
                                    <PermissionIconButton
                                        permission={UPDATE_PROJECT}
                                        projectId={projectId}
                                        onClick={() =>
                                            navigate(
                                                `/projects/${projectId}/edit`
                                            )
                                        }
                                        tooltipProps={{ title: 'Edit project' }}
                                        data-loading
                                        data-testid={NAVIGATE_TO_EDIT_PROJECT}
                                    >
                                        <Edit />
                                    </PermissionIconButton>
                                }
                            />
                            <ConditionallyRender
                                condition={!isOss()}
                                show={
                                    <PermissionIconButton
                                        permission={DELETE_PROJECT}
                                        projectId={projectId}
                                        onClick={() => {
                                            setShowDelDialog(true);
                                        }}
                                        tooltipProps={{
                                            title: 'Delete project',
                                        }}
                                        data-loading
                                    >
                                        <Delete />
                                    </PermissionIconButton>
                                }
                            />
                        </StyledDiv>
                    </StyledTopRow>
                </StyledInnerContainer>

                <StyledSeparator />
                <StyledTabContainer>
                    <Tabs
                        value={activeTab?.path}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        allowScrollButtonsMobile
                    >
                        {tabs.map(tab => (
                            <StyledTab
                                key={tab.title}
                                label={tab.title}
                                value={tab.path}
                                onClick={() => navigate(tab.path)}
                                data-testid={`TAB_${tab.title}`}
                            />
                        ))}
                    </Tabs>
                </StyledTabContainer>
            </StyledHeader>
            <DeleteProjectDialogue
                project={projectId}
                open={showDelDialog}
                onClose={() => {
                    setShowDelDialog(false);
                }}
                onSuccess={() => {
                    navigate('/projects');
                }}
            />
            <Routes>
                <Route path="health" element={<ProjectHealth />} />
                <Route
                    path="access/*"
                    element={
                        <Navigate
                            replace
                            to={`/projects/${projectId}/settings/access`}
                        />
                    }
                />
                <Route path="environments" element={<ProjectEnvironment />} />
                <Route path="archive" element={<ProjectFeaturesArchive />} />
                <Route path="logs" element={<ProjectLog />} />
                <Route
                    path="change-requests"
                    element={<ProjectChangeRequests />}
                />
                <Route
                    path="change-requests/:id"
                    element={<ChangeRequestOverview />}
                />
                <Route path="settings/*" element={<ProjectSettings />} />
                <Route path="*" element={<ProjectOverview />} />
            </Routes>
            <ImportModal
                open={modalOpen}
                setOpen={setModalOpen}
                project={projectId}
            />
        </div>
    );
};
