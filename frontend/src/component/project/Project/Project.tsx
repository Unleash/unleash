import { useNavigate } from 'react-router';
import useLoading from 'hooks/useLoading';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ReactComponent as ProjectStatusSvg } from 'assets/icons/projectStatus.svg';
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
import {
    Badge as CounterBadge,
    Box,
    Paper,
    Tabs,
    Typography,
    styled,
    Button,
} from '@mui/material';
import useToast from 'hooks/useToast';
import useQueryParams from 'hooks/useQueryParams';
import { useEffect, useState, type ReactNode } from 'react';
import ProjectFlags from './ProjectFlags.tsx';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import {
    Navigate,
    Route,
    Routes,
    useLocation,
    useSearchParams,
} from 'react-router-dom';
import { DeleteProjectDialogue } from './DeleteProject/DeleteProjectDialogue.tsx';
import { ProjectLog } from './ProjectLog/ProjectLog.tsx';
import { ChangeRequestOverview } from 'component/changeRequest/ChangeRequestOverview/ChangeRequestOverview';
import { ProjectChangeRequests } from '../../changeRequest/ProjectChangeRequests/ProjectChangeRequests.tsx';
import { ProjectSettings } from './ProjectSettings/ProjectSettings.tsx';
import { useFavoriteProjectsApi } from 'hooks/api/actions/useFavoriteProjectsApi/useFavoriteProjectsApi';
import { ImportModal } from './Import/ImportModal.tsx';
import { EnterpriseBadge } from 'component/common/EnterpriseBadge/EnterpriseBadge';
import { Badge } from 'component/common/Badge/Badge';
import type { UiFlags } from 'interfaces/uiConfig';
import { HiddenProjectIconWithTooltip } from './HiddenProjectIconWithTooltip/HiddenProjectIconWithTooltip.tsx';
import { ChangeRequestPlausibleProvider } from 'component/changeRequest/ChangeRequestContext';
import { ProjectApplications } from '../ProjectApplications/ProjectApplications.tsx';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { ProjectArchived } from './ArchiveProject/ProjectArchived.tsx';
import { usePlausibleTracker } from '../../../hooks/usePlausibleTracker.ts';
import { useActionableChangeRequests } from 'hooks/api/getters/useActionableChangeRequests/useActionableChangeRequests';
import { ProjectStatusModal } from './ProjectStatus/ProjectStatusModal.tsx';
import BreadcrumbNav from 'component/common/BreadcrumbNav/BreadcrumbNav.tsx';

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
    ossPath?: string;
    name: string;
    flag?: keyof UiFlags;
    new?: boolean;
    isEnterprise?: boolean;
    labelOverride?: () => ReactNode;
}

const StyledCounterBadge = styled(CounterBadge)(({ theme }) => ({
    '.MuiBadge-badge': {
        backgroundColor: theme.palette.background.alternative,
        right: '-4px',
    },
    [theme.breakpoints.down('md')]: {
        right: '6px',
    },
    flex: 'auto',
    justifyContent: 'center',
    minHeight: '1.5em',
    alignItems: 'center',
}));

const TabText = styled('span')(({ theme }) => ({
    color: theme.palette.text.primary,
}));

const ChangeRequestsLabel = () => {
    const projectId = useRequiredPathParam('projectId');
    const { total } = useActionableChangeRequests(projectId);

    return (
        <StyledCounterBadge badgeContent={total ?? 0} color='primary'>
            <TabText>Change requests</TabText>
        </StyledCounterBadge>
    );
};

const ProjectStatusButton = styled(Button)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 'bold',
    'svg *': {
        fill: theme.palette.primary.main,
    },
}));

const ProjectStatusSvgWithMargin = styled(ProjectStatusSvg)(({ theme }) => ({
    marginLeft: theme.spacing(0.5),
}));

const ProjectStatus = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [projectStatusOpen, setProjectStatusOpen] = useState(
        searchParams.has('project-status'),
    );
    const openStatusModal = () => {
        searchParams.set('project-status', '');
        setSearchParams(searchParams);
        setProjectStatusOpen(true);
    };
    const closeStatusModal = () => {
        searchParams.delete('project-status');
        setSearchParams(searchParams);
        setProjectStatusOpen(false);
    };

    return (
        <>
            <ProjectStatusButton
                onClick={openStatusModal}
                startIcon={<ProjectStatusSvgWithMargin />}
                data-loading-project
            >
                Project status
            </ProjectStatusButton>
            <ProjectStatusModal
                open={projectStatusOpen}
                onClose={closeStatusModal}
                onFollowLink={() => setProjectStatusOpen(false)}
            />
        </>
    );
};

export const Project = () => {
    const projectId = useRequiredPathParam('projectId');
    const { trackEvent } = usePlausibleTracker();
    const params = useQueryParams();
    const { project, loading, error, refetch } = useProjectOverview(projectId);
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
            name: 'flags',
        },
        {
            title: 'Change requests',
            path: `${basePath}/change-requests`,
            name: 'change-request',
            isEnterprise: true,
            labelOverride: ChangeRequestsLabel,
        },
        {
            title: 'Applications',
            path: `${basePath}/applications`,
            name: 'applications',
        },
        {
            title: 'Event log',
            path: `${basePath}/logs`,
            name: 'logs',
        },
        {
            title: 'Settings',
            path: `${basePath}/settings`,
            ossPath: `${basePath}/settings/api-access`,
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

    const onFavorite = async () => {
        try {
            if (project?.favorite) {
                await unfavorite(projectId);
            } else {
                await favorite(projectId);
            }
            refetch();
        } catch (_error) {
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

    if (project.archivedAt) {
        return <ProjectArchived name={project.name} />;
    }

    return (
        <div ref={ref}>
            <BreadcrumbNav />
            <StyledHeader>
                <StyledInnerContainer>
                    <StyledTopRow>
                        <StyledDiv>
                            <StyledFavoriteIconButton
                                onClick={onFavorite}
                                isFavorite={project?.favorite || false}
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
                            <ProjectStatus />
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
                                    label={
                                        tab.labelOverride ? (
                                            <tab.labelOverride />
                                        ) : (
                                            tab.title
                                        )
                                    }
                                    value={tab.path}
                                    onClick={() => {
                                        if (tab.title !== 'Flags') {
                                            trackEvent('project-navigation', {
                                                props: {
                                                    eventType: tab.title,
                                                },
                                            });
                                        }
                                        navigate(
                                            isOss() && tab.ossPath
                                                ? tab.ossPath
                                                : tab.path,
                                        );
                                    }}
                                    data-testid={`TAB_${tab.title}`}
                                    iconPosition={
                                        tab.isEnterprise ? 'end' : undefined
                                    }
                                    icon={
                                        <>
                                            <ConditionallyRender
                                                condition={Boolean(tab.new)}
                                                show={
                                                    // extra span to avoid badge getting color override from the overly specific parent component
                                                    <span>
                                                        <StyledBadge color='success'>
                                                            Beta
                                                        </StyledBadge>
                                                    </span>
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
                projectId={projectId}
                open={showDelDialog}
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
