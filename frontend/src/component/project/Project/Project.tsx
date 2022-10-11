import { useNavigate } from 'react-router';
import useProject from 'hooks/api/getters/useProject/useProject';
import useLoading from 'hooks/useLoading';
import ApiError from 'component/common/ApiError/ApiError';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStyles } from './Project.styles';
import { styled, Tab, Tabs } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import useToast from 'hooks/useToast';
import useQueryParams from 'hooks/useQueryParams';
import { useEffect, useState } from 'react';
import { ProjectAccess } from '../ProjectAccess/ProjectAccess';
import ProjectEnvironment from '../ProjectEnvironment/ProjectEnvironment';
import { ProjectFeaturesArchive } from './ProjectFeaturesArchive/ProjectFeaturesArchive';
import ProjectOverview from './ProjectOverview';
import ProjectHealth from './ProjectHealth/ProjectHealth';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import {
    DELETE_PROJECT,
    UPDATE_PROJECT,
} from 'component/providers/AccessProvider/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { Routes, Route, useLocation } from 'react-router-dom';
import { DeleteProjectDialogue } from './DeleteProject/DeleteProjectDialogue';
import { ProjectLog } from './ProjectLog/ProjectLog';

const StyledDiv = styled('div')(() => ({
    display: 'flex',
}));

const StyledName = styled('div')(({ theme }) => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    paddingBottom: theme.spacing(2),
}));

const StyledTitle = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    fontWeight: 'normal',
}));
const StyledText = styled(StyledTitle)(({ theme }) => ({
    color: theme.palette.grey[800],
}));

const Project = () => {
    const projectId = useRequiredPathParam('projectId');
    const params = useQueryParams();
    const { project, error, loading, refetch } = useProject(projectId);
    const ref = useLoading(loading);
    const { setToastData } = useToast();
    const { classes: styles } = useStyles();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { isOss } = useUiConfig();
    const basePath = `/projects/${projectId}`;
    const projectName = project?.name || projectId;

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
            title: 'Access',
            path: `${basePath}/access`,
            name: 'access',
        },
        {
            title: 'Environments',
            path: `${basePath}/environments`,
            name: 'environments',
        },
        {
            title: 'Archive',
            path: `${basePath}/archive`,
            name: 'archive',
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

    return (
        <div ref={ref}>
            <div className={styles.header}>
                <div className={styles.innerContainer}>
                    <h2 className={styles.title}>
                        <div>
                            <StyledName data-loading>{projectName}</StyledName>
                            <ConditionallyRender
                                condition={Boolean(project.description)}
                                show={
                                    <StyledDiv>
                                        <StyledTitle data-loading>
                                            Description:&nbsp;
                                        </StyledTitle>
                                        <StyledText data-loading>
                                            {project.description}
                                        </StyledText>
                                    </StyledDiv>
                                }
                            />
                            <StyledDiv>
                                <StyledTitle data-loading>
                                    projectId:&nbsp;
                                </StyledTitle>
                                <StyledText data-loading>
                                    {projectId}
                                </StyledText>
                            </StyledDiv>
                        </div>
                        <StyledDiv>
                            <PermissionIconButton
                                permission={UPDATE_PROJECT}
                                projectId={projectId}
                                sx={{
                                    visibility: isOss() ? 'hidden' : 'visible',
                                }}
                                onClick={() =>
                                    navigate(`/projects/${projectId}/edit`)
                                }
                                tooltipProps={{ title: 'Edit project' }}
                                data-loading
                            >
                                <Edit />
                            </PermissionIconButton>
                            <PermissionIconButton
                                permission={DELETE_PROJECT}
                                projectId={projectId}
                                sx={{
                                    visibility: isOss() ? 'hidden' : 'visible',
                                }}
                                onClick={() => {
                                    setShowDelDialog(true);
                                }}
                                tooltipProps={{ title: 'Delete project' }}
                                data-loading
                            >
                                <Delete />
                            </PermissionIconButton>
                        </StyledDiv>
                    </h2>
                </div>
                <ConditionallyRender
                    condition={error}
                    show={
                        <ApiError
                            data-loading
                            style={{ maxWidth: '400px', margin: '1rem' }}
                            onClick={refetch}
                            text="Could not fetch project"
                        />
                    }
                />
                <div className={styles.separator} />
                <div className={styles.tabContainer}>
                    <Tabs
                        value={activeTab?.path}
                        indicatorColor="primary"
                        textColor="primary"
                    >
                        {tabs.map(tab => (
                            <Tab
                                key={tab.title}
                                label={tab.title}
                                value={tab.path}
                                onClick={() => navigate(tab.path)}
                                className={styles.tabButton}
                            />
                        ))}
                    </Tabs>
                </div>
            </div>
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
                <Route path="access/*" element={<ProjectAccess />} />
                <Route path="environments" element={<ProjectEnvironment />} />
                <Route path="archive" element={<ProjectFeaturesArchive />} />
                <Route path="logs" element={<ProjectLog />} />
                <Route path="*" element={<ProjectOverview />} />
            </Routes>
        </div>
    );
};

export default Project;
