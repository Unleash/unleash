import { type FC, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import ApiError from 'component/common/ApiError/ApiError';
import { styled, useMediaQuery } from '@mui/material';
import theme from 'themes/theme';
import { Search } from 'component/common/Search/Search';
import { ProjectGroup } from './ProjectGroup.tsx';
import {
    ProjectArchiveCard,
    type ProjectArchiveCardProps,
} from '../ProjectCard/ProjectArchiveCard.tsx';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { ReviveProjectDialog } from './ReviveProjectDialog/ReviveProjectDialog.tsx';
import { DeleteProjectDialogue } from '../Project/DeleteProject/DeleteProjectDialogue.tsx';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { safeRegExp } from '@server/util/escape-regex';

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

export const ArchiveProjectList: FC = () => {
    const { projects, loading, error, refetch } = useProjects({
        archived: true,
    });

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchValue, setSearchValue] = useState(
        searchParams.get('search') || '',
    );
    const [reviveProject, setReviveProject] = useState<{
        isOpen: boolean;
        id?: string;
        name?: string;
    }>({ isOpen: false });
    const [deleteProject, setDeleteProject] = useState<{
        isOpen: boolean;
        id?: string;
        name?: string;
    }>({ isOpen: false });

    useEffect(() => {
        const tableState: PageQueryType = {};
        if (searchValue) {
            tableState.search = searchValue;
        }

        setSearchParams(tableState, {
            replace: true,
        });
    }, [searchValue, setSearchParams]);

    const ProjectCard: FC<
        Omit<ProjectArchiveCardProps, 'onRevive' | 'onDelete'>
    > = ({ id, ...props }) => (
        <ProjectArchiveCard
            onRevive={() =>
                setReviveProject({
                    isOpen: true,
                    id,
                    name: projects?.find((project) => project.id === id)?.name,
                })
            }
            onDelete={() =>
                setDeleteProject({
                    id,
                    name: projects?.find((project) => project.id === id)?.name,
                    isOpen: true,
                })
            }
            id={id}
            {...props}
        />
    );

    const filteredProjects = useMemo(
        () =>
            searchValue
                ? projects.filter((project) =>
                      safeRegExp(searchValue, 'i').test(project.name),
                  )
                : projects,
        [projects, searchValue],
    );

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Projects archive (${projects.length || 0})`}
                    actions={
                        <ConditionallyRender
                            condition={!isSmallScreen}
                            show={
                                <Search
                                    initialValue={searchValue}
                                    onChange={setSearchValue}
                                />
                            }
                        />
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

                <SearchHighlightProvider value={searchValue}>
                    <ProjectGroup
                        loading={loading}
                        projects={filteredProjects}
                        placeholder='No archived projects found'
                        ProjectCardComponent={ProjectCard}
                        link={false}
                    />
                </SearchHighlightProvider>
            </StyledContainer>
            <ReviveProjectDialog
                id={reviveProject.id || ''}
                name={reviveProject.name || ''}
                open={reviveProject.isOpen}
                onClose={() =>
                    setReviveProject((state) => ({ ...state, isOpen: false }))
                }
            />
            <DeleteProjectDialogue
                projectId={deleteProject.id || ''}
                projectName={deleteProject.name || ''}
                open={deleteProject.isOpen}
                onClose={() => {
                    setDeleteProject((state) => ({ ...state, isOpen: false }));
                }}
            />
        </PageContent>
    );
};
