import { useContext, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BooleanParam, StringParam, withDefault } from 'use-query-params';
import { mutate } from 'swr';
import { getProjectFetcher } from 'hooks/api/getters/useProject/getProjectFetcher';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ProjectCard } from '../ProjectCard/ProjectCard';
import type { IProjectCard } from 'interfaces/project';
import loadingData from './loadingData';
import { PageContent } from 'component/common/PageContent/PageContent';
import AccessContext from 'contexts/AccessContext';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { CREATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import Add from '@mui/icons-material/Add';
import ApiError from 'component/common/ApiError/ApiError';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { TablePlaceholder } from 'component/common/Table';
import {
    useMediaQuery,
    styled,
    ToggleButtonGroup,
    ToggleButton,
} from '@mui/material';
import theme from 'themes/theme';
import { Search } from 'component/common/Search/Search';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import type { ITooltipResolverProps } from 'component/common/TooltipResolver/TooltipResolver';
import { ReactComponent as ProPlanIcon } from 'assets/icons/pro-enterprise-feature-badge.svg';
import { ReactComponent as ProPlanIconLight } from 'assets/icons/pro-enterprise-feature-badge-light.svg';
import { safeRegExp } from '@server/util/escape-regex';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { useUiFlag } from 'hooks/useUiFlag';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import { useProfile } from 'hooks/api/getters/useProfile/useProfile';
import { shouldDisplayInMyProjects } from './should-display-in-my-projects';

const StyledDivContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    [theme.breakpoints.down('sm')]: {
        justifyContent: 'center',
    },
}));

const StyledApiError = styled(ApiError)(({ theme }) => ({
    maxWidth: '400px',
    marginBottom: theme.spacing(2),
}));

const StyledCardLink = styled(Link)(({ theme }) => ({
    color: 'inherit',
    textDecoration: 'none',
    border: 'none',
    padding: '0',
    background: 'transparent',
    fontFamily: theme.typography.fontFamily,
    pointer: 'cursor',
}));

const StyledButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    button: {
        color: theme.palette.primary.main,
        borderColor: theme.palette.background.alternative,
        textTransform: 'none',
        paddingInline: theme.spacing(3),
        transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    },
    'button[aria-pressed=true]': {
        backgroundColor: theme.palette.background.alternative,
        color: theme.palette.primary.contrastText,

        '&:hover': {
            backgroundColor: theme.palette.action.alternative,
        },
    },
}));

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
    const showProjectFilterButtons = useUiFlag('projectListFilterMyProjects');
    const myProjects = new Set(useProfile().profile?.projects || []);

    const filterOptions = [
        {
            label: 'All projects',
            value: false,
        },
        {
            label: 'My projects',
            value: true,
        },
    ];

    const stateConfig = {
        myProjects: withDefault(BooleanParam, false),
        search: withDefault(StringParam, ''),
    };
    const [filterState, setFilterState] = usePersistentTableState(
        `projects-list`,
        stateConfig,
    );
    const searchValue = filterState.search;

    const filteredProjects = useMemo(() => {
        const preFilteredProjects =
            showProjectFilterButtons && filterState.myProjects
                ? projects.filter(shouldDisplayInMyProjects(myProjects))
                : projects;

        const regExp = safeRegExp(searchValue, 'i');
        return (
            searchValue
                ? preFilteredProjects.filter((project) =>
                      regExp.test(project.name),
                  )
                : preFilteredProjects
        ).sort((a, b) => {
            if (a?.favorite && !b?.favorite) {
                return -1;
            }
            if (!a?.favorite && b?.favorite) {
                return 1;
            }
            return 0;
        });
    }, [
        projects,
        searchValue,
        filterState.myProjects,
        myProjects,
        showProjectFilterButtons,
    ]);

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

    const renderError = () => {
        return (
            <StyledApiError onClick={refetch} text='Error fetching projects' />
        );
    };

    const projectCount =
        filteredProjects.length < projects.length
            ? `${filteredProjects.length} of ${projects.length}`
            : projects.length;

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Projects (${projectCount})`}
                    leftActions={
                        <ConditionallyRender
                            condition={showProjectFilterButtons}
                            show={
                                <StyledButtonGroup
                                    aria-label='project list filter'
                                    size='small'
                                    color='primary'
                                    value={filterState.myProjects}
                                    exclusive
                                    onChange={(event, value) => {
                                        if (value !== null) {
                                            setFilterState({
                                                myProjects: value,
                                            });
                                        }
                                    }}
                                >
                                    {filterOptions.map((filter) => {
                                        return (
                                            <ToggleButton
                                                key={`${filter.value}`}
                                                value={filter.value}
                                            >
                                                {filter.label}
                                            </ToggleButton>
                                        );
                                    })}
                                </StyledButtonGroup>
                            }
                        />
                    }
                    actions={
                        <>
                            <ConditionallyRender
                                condition={!isSmallScreen}
                                show={
                                    <>
                                        <Search
                                            initialValue={searchValue}
                                            onChange={(search) =>
                                                setFilterState({ search })
                                            }
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
                                onChange={(search) =>
                                    setFilterState({ search })
                                }
                            />
                        }
                    />
                </PageHeader>
            }
        >
            <ConditionallyRender condition={error} show={renderError()} />
            <StyledDivContainer>
                <ConditionallyRender
                    condition={filteredProjects.length < 1 && !loading}
                    show={
                        <ConditionallyRender
                            condition={searchValue?.length > 0}
                            show={
                                <TablePlaceholder>
                                    No projects found matching &ldquo;
                                    {searchValue}
                                    &rdquo;
                                </TablePlaceholder>
                            }
                            elseShow={
                                <TablePlaceholder>
                                    No projects available.
                                </TablePlaceholder>
                            }
                        />
                    }
                    elseShow={
                        <ConditionallyRender
                            condition={loading}
                            show={() =>
                                loadingData.map((project: IProjectCard) => (
                                    <ProjectCard
                                        data-loading
                                        onHover={() => {}}
                                        key={project.id}
                                        name={project.name}
                                        id={project.id}
                                        mode={project.mode}
                                        memberCount={2}
                                        health={95}
                                        featureCount={4}
                                    />
                                ))
                            }
                            elseShow={() =>
                                filteredProjects.map(
                                    (project: IProjectCard) => (
                                        <StyledCardLink
                                            key={project.id}
                                            to={`/projects/${project.id}`}
                                        >
                                            <ProjectCard
                                                onHover={() =>
                                                    handleHover(project.id)
                                                }
                                                name={project.name}
                                                mode={project.mode}
                                                memberCount={
                                                    project.memberCount ?? 0
                                                }
                                                health={project.health}
                                                id={project.id}
                                                featureCount={
                                                    project.featureCount
                                                }
                                                isFavorite={project.favorite}
                                            />
                                        </StyledCardLink>
                                    ),
                                )
                            }
                        />
                    }
                />
            </StyledDivContainer>
        </PageContent>
    );
};
