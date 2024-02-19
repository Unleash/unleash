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
import { Box, Paper, Tabs, Typography, styled } from '@mui/material';
import { FileUpload } from '@mui/icons-material';
import useToast from 'hooks/useToast';
import useQueryParams from 'hooks/useQueryParams';
import { useEffect, useState } from 'react';
import ProjectEnvironment from '../ProjectEnvironment/ProjectEnvironment';
import { ProjectFeaturesArchive } from './ProjectFeaturesArchive/ProjectFeaturesArchive';
import ProjectOverview from './ProjectOverview';
import ProjectHealth from './ProjectHealth/ProjectHealth';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
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
import { EnterpriseBadge } from 'component/common/EnterpriseBadge/EnterpriseBadge';
import { Badge } from 'component/common/Badge/Badge';
import { ProjectDoraMetrics } from './ProjectDoraMetrics/ProjectDoraMetrics';
import { UiFlags } from 'interfaces/uiConfig';
import { HiddenProjectIconWithTooltip } from './HiddenProjectIconWithTooltip/HiddenProjectIconWithTooltip';
import { ChangeRequestPlausibleProvider } from 'component/changeRequest/ChangeRequestContext';
import { ProjectApplications } from '../ProjectApplications/ProjectApplications';

const StyledBadge = styled(Badge)(({ theme }) => ({
    position: 'absolute',
    top: 5,
    right: 20,
    [theme.breakpoints.down('md')]: {
        top: 2,
    },
}));

interface ITab {
    title: string;
    path: string;
    name: string;
    flag?: keyof UiFlags;
    new?: boolean;
    isEnterprise?: boolean;
}

export const Project = () => {
    const projectId = useRequiredPathParam('projectId');
    const params = useQueryParams();
    const { project, loading, error, refetch } = useProject(projectId);
    const ref = useLoading(loading, '[data-loading-project=true]');
    const { setToastData, setToastApiError } = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { isOss, uiConfig, isPro } = useUiConfig();
    const basePath = `/projects/${projectId}`;
    const projectName = project?.name || projectId;
    const { favorite, unfavorite } = useFavoriteProjectsApi();

    const [showDelDialog, setShowDelDialog] = useState(false);

    const [
        changeRequestChangesWillOverwrite,
        setChangeRequestChangesWillOverwrite,
    ] = useState(false);

    const tabs: ITab[] = [
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
            isEnterprise: true,
        },
        {
            title: 'Metrics',
            path: `${basePath}/metrics`,
            name: 'dora',
            isEnterprise: true,
        },
        {
            title: 'Applications',
            path: `${basePath}/applications`,
            name: 'applications',
            flag: 'sdkReporting',
        },
        {
            title: 'Event log',
            path: `${basePath}/logs`,
            name: 'logs',
        },
        {
            title: 'Project settings',
            path: `${basePath}/settings${isOss() ? '/environments' : ''}`,
            name: 'settings',
        },
    ];

    const filteredTabs = tabs
        .filter((tab) => {
            if (tab.flag) {
                return uiConfig.flags[tab.flag];
            }
            return true;
        })
        .filter((tab) => !(isOss() && tab.isEnterprise));

    const activeTab = [...filteredTabs]
        .reverse()
        .find((tab) => pathname.startsWith(tab.path));

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
            <Paper sx={(theme) => ({ padding: theme.spacing(2, 4, 4) })}>
                <Typography variant='h1'>404 Not Found</Typography>
                <Typography>
                    Project <strong>{projectId}</strong> does not exist.
                </Typography>
            </Paper>
        );
    }

    const onFavorite = async () => {
        try {
            if (project?.favorite) {
                await unfavorite(projectId);
            } else {
                await favorite(projectId);
            }
            refetch();
        } catch (error) {
            setToastApiError('Something went wrong, could not update favorite');
        }
    };

    const enterpriseIcon = (
        <Box
            sx={(theme) => ({
                marginLeft: theme.spacing(1),
                display: 'flex',
            })}
        >
            <EnterpriseBadge />
        </Box>
    );

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
                                <ConditionallyRender
                                    condition={project?.mode === 'private'}
                                    show={<HiddenProjectIconWithTooltip />}
                                />
                                <StyledName data-loading-project>
                                    {projectName}
                                </StyledName>
                            </StyledProjectTitle>
                        </StyledDiv>
                        <StyledDiv>
                            <ConditionallyRender
                                condition={Boolean(
                                    uiConfig?.flags?.featuresExportImport,
                                )}
                                show={
                                    <PermissionIconButton
                                        permission={UPDATE_FEATURE}
                                        projectId={projectId}
                                        onClick={() => setModalOpen(true)}
                                        tooltipProps={{ title: 'Import' }}
                                        data-testid={IMPORT_BUTTON}
                                        data-loading-project
                                    >
                                        <FileUpload />
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
                        indicatorColor='primary'
                        textColor='primary'
                        variant='scrollable'
                        allowScrollButtonsMobile
                    >
                        {filteredTabs.map((tab) => {
                            return (
                                <StyledTab
                                    data-loading-project
                                    key={tab.title}
                                    label={tab.title}
                                    value={tab.path}
                                    onClick={() => navigate(tab.path)}
                                    data-testid={`TAB_${tab.title}`}
                                    iconPosition={
                                        tab.isEnterprise ? 'end' : undefined
                                    }
                                    icon={
                                        <>
                                            <ConditionallyRender
                                                condition={Boolean(tab.new)}
                                                show={
                                                    <StyledBadge color='success'>
                                                        New
                                                    </StyledBadge>
                                                }
                                            />
                                            {(tab.isEnterprise &&
                                                isPro() &&
                                                enterpriseIcon) ||
                                                undefined}
                                        </>
                                    }
                                />
                            );
                        })}
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
                <Route path='health' element={<ProjectHealth />} />
                <Route
                    path='access/*'
                    element={
                        <Navigate
                            replace
                            to={`/projects/${projectId}/settings/access`}
                        />
                    }
                />
                <Route path='environments' element={<ProjectEnvironment />} />
                <Route path='archive' element={<ProjectFeaturesArchive />} />
                <Route path='logs' element={<ProjectLog />} />
                <Route
                    path='change-requests'
                    element={<ProjectChangeRequests />}
                />
                <Route
                    path='change-requests/:id'
                    element={
                        <ChangeRequestPlausibleProvider
                            value={{
                                willOverwriteStrategyChanges:
                                    changeRequestChangesWillOverwrite,
                                registerWillOverwriteStrategyChanges: () =>
                                    setChangeRequestChangesWillOverwrite(true),
                            }}
                        >
                            <ChangeRequestOverview />
                        </ChangeRequestPlausibleProvider>
                    }
                />
                <Route path='settings/*' element={<ProjectSettings />} />
                <Route path='metrics' element={<ProjectDoraMetrics />} />
                <Route path='applications' element={<ProjectApplications />} />
                <Route path='*' element={<ProjectOverview />} />
            </Routes>
            <ImportModal
                open={modalOpen}
                setOpen={setModalOpen}
                project={projectId}
            />
        </div>
    );
};
