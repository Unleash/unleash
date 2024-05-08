import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mutate } from 'swr';
import { getProjectFetcher } from 'hooks/api/getters/useProject/getProjectFetcher';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { IProjectCard } from 'interfaces/project';
import { PageContent } from 'component/common/PageContent/PageContent';
import AccessContext from 'contexts/AccessContext';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { CREATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import Add from '@mui/icons-material/Add';
import ApiError from 'component/common/ApiError/ApiError';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useMediaQuery, styled } from '@mui/material';
import theme from 'themes/theme';
import { Search } from 'component/common/Search/Search';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import type { ITooltipResolverProps } from 'component/common/TooltipResolver/TooltipResolver';
import { ReactComponent as ProPlanIcon } from 'assets/icons/pro-enterprise-feature-badge.svg';
import { ReactComponent as ProPlanIconLight } from 'assets/icons/pro-enterprise-feature-badge-light.svg';
import { safeRegExp } from '@server/util/escape-regex';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { useUiFlag } from 'hooks/useUiFlag';
import { useProfile } from 'hooks/api/getters/useProfile/useProfile';
import { groupProjects } from './group-projects';
import { ProjectGroup } from './ProjectGroup';
import { CreateProjectDialogue } from '../Project/CreateProject/CreateProjectDialog/CreateProjectDialog';

const StyledApiError = styled(ApiError)(({ theme }) => ({
    maxWidth: '500px',
    marginBottom: theme.spacing(2),
}));

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
}));

type PageQueryType = Partial<Record<'search', string>>;

type projectMap = {
    [index: string]: boolean;
};

interface ICreateButtonData {
    disabled: boolean;
    tooltip?: Omit<ITooltipResolverProps, 'children'>;
    endIcon?: React.ReactNode;
}

const NAVIGATE_TO_CREATE_PROJECT = 'NAVIGATE_TO_CREATE_PROJECT';

function resolveCreateButtonData(
    isOss: boolean,
    hasAccess: boolean,
): ICreateButtonData {
    if (isOss) {
        return {
            disabled: true,
            tooltip: {
                titleComponent: (
                    <PremiumFeature feature='adding-new-projects' tooltip />
                ),
                sx: { maxWidth: '320px' },
                variant: 'custom',
            },
            endIcon: (
                <ThemeMode
                    darkmode={<ProPlanIconLight />}
                    lightmode={<ProPlanIcon />}
                />
            ),
        };
    } else if (!hasAccess) {
        return {
            tooltip: {
                title: 'You do not have permission to create new projects',
            },
            disabled: true,
        };
    } else {
        return {
            tooltip: { title: 'Click to create a new project' },
            disabled: false,
        };
    }
}

export const ProjectListNew = () => {
    const { hasAccess } = useContext(AccessContext);
    const navigate = useNavigate();
    const { projects, loading, error, refetch } = useProjects();
    const [fetchedProjects, setFetchedProjects] = useState<projectMap>({});
    const { isOss } = useUiConfig();

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchValue, setSearchValue] = useState(
        searchParams.get('search') || '',
    );

    const splitProjectList = useUiFlag('projectListFilterMyProjects');
    const myProjects = new Set(useProfile().profile?.projects || []);

    const showCreateDialog = Boolean(searchParams.get('create'));
    const [openCreateDialog, setOpenCreateDialog] = useState(showCreateDialog);
    const useNewProjectForm = useUiFlag('newCreateProjectUI');

    useEffect(() => {
        const tableState: PageQueryType = {};
        if (searchValue) {
            tableState.search = searchValue;
        }

        setSearchParams(tableState, {
            replace: true,
        });
    }, [searchValue, setSearchParams]);

    const filteredProjects = useMemo(() => {
        const regExp = safeRegExp(searchValue, 'i');
        return (
            searchValue
                ? projects.filter((project) => regExp.test(project.name))
                : projects
        ).sort((a, b) => {
            if (a?.favorite && !b?.favorite) {
                return -1;
            }
            if (!a?.favorite && b?.favorite) {
                return 1;
            }
            return 0;
        });
    }, [projects, searchValue]);

    const groupedProjects = useMemo(() => {
        if (!splitProjectList) {
            return { myProjects: [], otherProjects: filteredProjects };
        }
        return groupProjects(myProjects, filteredProjects);
    }, [filteredProjects, myProjects, splitProjectList]);

    const handleHover = (projectId: string) => {
        if (fetchedProjects[projectId]) {
            return;
        }

        const { KEY, fetcher } = getProjectFetcher(projectId);
        mutate(KEY, fetcher);
        setFetchedProjects((prev) => ({ ...prev, [projectId]: true }));
    };

    const createButtonData = resolveCreateButtonData(
        isOss(),
        hasAccess(CREATE_PROJECT),
    );

    const projectCount =
        filteredProjects.length < projects.length
            ? `${filteredProjects.length} of ${projects.length}`
            : projects.length;

    const ProjectGroupComponent = (props: {
        sectionTitle?: string;
        projects: IProjectCard[];
    }) => {
        return (
            <ProjectGroup
                loading={loading}
                searchValue={searchValue}
                handleHover={handleHover}
                {...props}
            />
        );
    };

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Projects (${projectCount})`}
                    actions={
                        <>
                            <ConditionallyRender
                                condition={!isSmallScreen}
                                show={
                                    <>
                                        <Search
                                            initialValue={searchValue}
                                            onChange={setSearchValue}
                                        />
                                        <PageHeader.Divider />
                                    </>
                                }
                            />
                            <ResponsiveButton
                                Icon={Add}
                                endIcon={createButtonData.endIcon}
                                onClick={() => navigate('/projects/create')}
                                maxWidth='700px'
                                permission={CREATE_PROJECT}
                                disabled={createButtonData.disabled}
                                tooltipProps={createButtonData.tooltip}
                                data-testid={NAVIGATE_TO_CREATE_PROJECT}
                            >
                                New project
                            </ResponsiveButton>
                        </>
                    }
                >
                    <ConditionallyRender
                        condition={isSmallScreen}
                        show={
                            <Search
                                initialValue={searchValue}
                                onChange={setSearchValue}
                            />
                        }
                    />
                </PageHeader>
            }
        >
            <StyledContainer>
                <ConditionallyRender
                    condition={error}
                    show={() => (
                        <StyledApiError
                            onClick={refetch}
                            text='Error fetching projects'
                        />
                    )}
                />
                <ConditionallyRender
                    condition={splitProjectList}
                    show={
                        <>
                            <ProjectGroupComponent
                                sectionTitle='My projects'
                                projects={groupedProjects.myProjects}
                            />

                            <ProjectGroupComponent
                                sectionTitle='Other projects'
                                projects={groupedProjects.otherProjects}
                            />
                        </>
                    }
                    elseShow={
                        <ProjectGroupComponent projects={filteredProjects} />
                    }
                />
            </StyledContainer>
            <ConditionallyRender
                condition={useNewProjectForm}
                show={
                    <CreateProjectDialogue
                        open={openCreateDialog}
                        onClose={() => setOpenCreateDialog(false)}
                    />
                }
            />
        </PageContent>
    );
};
