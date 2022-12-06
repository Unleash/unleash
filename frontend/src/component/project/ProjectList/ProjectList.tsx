import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { mutate } from 'swr';
import { getProjectFetcher } from 'hooks/api/getters/useProject/getProjectFetcher';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ProjectCard } from '../ProjectCard/ProjectCard';
import { useStyles } from './ProjectList.styles';
import { IProjectCard } from 'interfaces/project';
import loadingData from './loadingData';
import { PageContent } from 'component/common/PageContent/PageContent';
import AccessContext from 'contexts/AccessContext';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { CREATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import { Add } from '@mui/icons-material';
import ApiError from 'component/common/ApiError/ApiError';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { TablePlaceholder } from 'component/common/Table';
import { useMediaQuery } from '@mui/material';
import theme from 'themes/theme';
import { Search } from 'component/common/Search/Search';
import {
    PlausibleOrigin,
    PremiumFeature,
} from 'component/common/PremiumFeature/PremiumFeature';
import { ITooltipResolverProps } from 'component/common/TooltipResolver/TooltipResolver';
import { ReactComponent as ProPlanIcon } from 'assets/icons/pro-enterprise-feature-badge.svg';

type PageQueryType = Partial<Record<'search', string>>;

type projectMap = {
    [index: string]: boolean;
};

interface ICreateButtonData {
    disabled: boolean;
    tooltip?: Omit<ITooltipResolverProps, 'children'>;
    endIcon?: React.ReactNode;
}

function resolveCreateButtonData(
    isOss: boolean,
    hasAccess: boolean
): ICreateButtonData {
    if (isOss) {
        return {
            disabled: true,
            tooltip: {
                titleComponent: (
                    <PremiumFeature origin={PlausibleOrigin.PROJECT}>
                        To be able to add more projects you need to upgrade to
                        Pro or Enterprise plan
                    </PremiumFeature>
                ),
                sx: { maxWidth: '320px' },
                variant: 'custom',
            },
            endIcon: <ProPlanIcon />,
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
    const { classes: styles } = useStyles();
    const { projects, loading, error, refetch } = useProjects();
    const [fetchedProjects, setFetchedProjects] = useState<projectMap>({});
    const { isOss } = useUiConfig();

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchValue, setSearchValue] = useState(
        searchParams.get('search') || ''
    );

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
        const regExp = new RegExp(searchValue, 'i');
        return (
            searchValue
                ? projects.filter(project => regExp.test(project.name))
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

    const handleHover = (projectId: string) => {
        if (fetchedProjects[projectId]) {
            return;
        }

        const { KEY, fetcher } = getProjectFetcher(projectId);
        mutate(KEY, fetcher);
        setFetchedProjects(prev => ({ ...prev, [projectId]: true }));
    };

    const createButtonData = resolveCreateButtonData(
        isOss(),
        hasAccess(CREATE_PROJECT)
    );

    const renderError = () => {
        return (
            <ApiError
                onClick={refetch}
                className={styles.apiError}
                text="Error fetching projects"
            />
        );
    };

    let projectCount =
        filteredProjects.length < projects.length
            ? `${filteredProjects.length} of ${projects.length}`
            : projects.length;

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
                                maxWidth="700px"
                                permission={CREATE_PROJECT}
                                disabled={createButtonData.disabled}
                                tooltipProps={createButtonData.tooltip}
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
            <ConditionallyRender condition={error} show={renderError()} />
            <div className={styles.container}>
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
                                        memberCount={2}
                                        health={95}
                                        featureCount={4}
                                    />
                                ))
                            }
                            elseShow={() =>
                                filteredProjects.map(
                                    (project: IProjectCard) => (
                                        <Link
                                            key={project.id}
                                            to={`/projects/${project.id}`}
                                            className={styles.cardLink}
                                        >
                                            <ProjectCard
                                                onHover={() =>
                                                    handleHover(project.id)
                                                }
                                                name={project.name}
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
                                        </Link>
                                    )
                                )
                            }
                        />
                    }
                />
            </div>
        </PageContent>
    );
};
