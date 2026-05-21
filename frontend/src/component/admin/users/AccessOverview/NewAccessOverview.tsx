import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useUserInfo from 'hooks/api/getters/useUserInfo/useUserInfo';
import { styled, useMediaQuery } from '@mui/material';
import { useMemo, useState } from 'react';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import theme from 'themes/theme';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useUserAccessOverview } from 'hooks/api/getters/useUserAccessOverview/useUserAccessOverview';
import { getCategorizedRootPermissions } from 'utils/permissions';
import type { IAccessOverviewPermissionCategory } from './AccessOverviewAccordion/AccessOverviewList.tsx';
import { Search } from 'component/common/Search/Search';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { RootAccessOverviewAccordion } from './AccessOverviewAccordion/RootAccessOverviewAccordion.tsx';
import { RootRoleGroupAccess } from './RootRoleGroupAccess.tsx';
import { filterCategory } from './ProjectAccess/ProjectAccess.tsx';
import { ProjectAccessSection } from './ProjectAccess/ProjectAccessSection.tsx';

const StyledActionsContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flex: 1,
    gap: theme.spacing(1),
    maxWidth: 800,
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        maxWidth: '100%',
    },
    '& > div': {
        width: '100%',
    },
}));

const StyledAccessOverviewContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

export const NewAccessOverview = () => {
    const id = useRequiredPathParam('id');
    const { projects } = useProjects();
    const { environments } = useEnvironments();
    const { user, loading } = useUserInfo(id);

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [searchValue, setSearchValue] = useState('');

    const { overview, rootRole } = useUserAccessOverview(id);

    const rootRoleGroups = overview?.groups.filter((r) => r.rootRole);

    const AccessActions = (
        <StyledActionsContainer>
            <Search initialValue={searchValue} onChange={setSearchValue} />
        </StyledActionsContainer>
    );

    const rootCategories = useMemo(() => {
        const categories = getCategorizedRootPermissions(
            overview?.root ?? [],
        ) as IAccessOverviewPermissionCategory[];

        if (!searchValue) return categories;

        return categories
            .map((category) => filterCategory(category, searchValue))
            .filter(Boolean) as IAccessOverviewPermissionCategory[];
    }, [overview?.root, searchValue]);

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Access overview for ${user.name || user.email || user.username}`}
                    actions={
                        <ConditionallyRender
                            condition={!isSmallScreen}
                            show={AccessActions}
                        />
                    }
                >
                    <ConditionallyRender
                        condition={isSmallScreen}
                        show={AccessActions}
                    />
                </PageHeader>
            }
        >
            <StyledAccessOverviewContainer>
                <SearchHighlightProvider value={searchValue}>
                    <RootAccessOverviewAccordion
                        rootRole={rootRole}
                        groups={rootRoleGroups}
                        categories={rootCategories}
                    />
                    <RootRoleGroupAccess groups={rootRoleGroups ?? []} />
                    <ProjectAccessSection
                        id={id}
                        projects={projects}
                        environments={environments}
                        searchValue={searchValue}
                    />
                </SearchHighlightProvider>
            </StyledAccessOverviewContainer>
        </PageContent>
    );
};
