import { type FC, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useProjectsArchive from 'hooks/api/getters/useProjectsArchive/useProjectsArchive';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import ApiError from 'component/common/ApiError/ApiError';
import { styled, useMediaQuery } from '@mui/material';
import theme from 'themes/theme';
import { Search } from 'component/common/Search/Search';
import { ProjectGroup } from './ProjectGroup';
import {
    ProjectArchiveCard,
    type ProjectArchiveCardProps,
} from '../NewProjectCard/ProjectArchiveCard';
import { ReviveProjectDialog } from './ReviveProjectDialog/ReviveProjectDialog';
import { DeleteProjectDialogue } from '../Project/DeleteProject/DeleteProjectDialogue';

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
    const { projects, loading, error, refetch } = useProjectsArchive();

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

    const onRevive = (id: string) => {
        setReviveProject({
            isOpen: true,
            id,
            name: projects?.find((project) => project.id === id)?.name,
        });
    };
    const onDelete = (id: string) => {
        setDeleteProject({
            id,
            isOpen: true,
        });
    };

    const ProjectCard: FC<
        Omit<ProjectArchiveCardProps, 'onRevive' | 'onDelete'>
    > = ({ id, ...props }) => (
        <ProjectArchiveCard
            onRevive={() => onRevive(id)}
            onDelete={() => onDelete(id)}
            id={id}
            {...props}
        />
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

                <ProjectGroup
                    loading={loading}
                    searchValue={searchValue}
                    projects={projects}
                    placeholder='No archived projects found'
                    ProjectCardComponent={ProjectCard}
                    link={false}
                />
            </StyledContainer>
            <ReviveProjectDialog
                id={reviveProject.id}
                name={reviveProject.name}
                open={reviveProject.isOpen}
                onClose={() =>
                    setReviveProject((state) => ({ ...state, isOpen: false }))
                }
                onSubmit={() => {
                    // TODO: toast
                    setReviveProject((state) => ({ ...state, isOpen: false }));
                }}
            />
            <DeleteProjectDialogue
                project={deleteProject.id || ''}
                open={deleteProject.isOpen}
                onClose={() => {
                    setDeleteProject((state) => ({ ...state, isOpen: false }));
                }}
                onSuccess={() => {
                    // TODO: toast
                    setDeleteProject((state) => ({ ...state, isOpen: false }));
                }}
            />
        </PageContent>
    );
};
