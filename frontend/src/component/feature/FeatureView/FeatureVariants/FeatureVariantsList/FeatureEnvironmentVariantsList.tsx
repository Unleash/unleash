import { Alert, styled, useMediaQuery, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { Search } from 'component/common/Search/Search';
import { UPDATE_FEATURE_VARIANTS } from 'component/providers/AccessProvider/permissions';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useProject from 'hooks/api/getters/useProject/useProject';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useSearch } from 'hooks/useSearch';
import { useState } from 'react';
import { EnvironmentVariantsCard } from './EnvironmentVariantsCard/EnvironmentVariantsCard';

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    '& code': {
        fontWeight: theme.fontWeight.bold,
    },
}));

export const FeatureEnvironmentVariantsList = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature, refetchFeature, loading } = useFeature(
        projectId,
        featureId
    );

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [searchValue, setSearchValue] = useState('');
    // TODO: Make this top level and shared between tables? Maybe import columns from EnvironmentVariantsTable?
    // const {
    //     data: searchedData,
    //     getSearchText,
    //     getSearchContext,
    // } = useSearch(columns, searchValue, features);

    const rows = [];

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Variants (${rows.length})`}
                    actions={
                        <ConditionallyRender
                            condition={!isSmallScreen}
                            show={
                                <>
                                    <Search
                                        initialValue={searchValue}
                                        onChange={setSearchValue}
                                        // hasFilters
                                        // getSearchContext={getSearchContext}
                                    />
                                    <PageHeader.Divider />
                                </>
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
                                // hasFilters
                                // getSearchContext={getSearchContext}
                            />
                        }
                    />
                </PageHeader>
            }
        >
            <StyledAlert severity="info">
                Variants allows you to return a variant object if the feature
                toggle is considered enabled for the current request. When using
                variants you should use the <code>getVariant()</code> method in
                the Client SDK.
            </StyledAlert>
            {feature.environments.map(environment => (
                <EnvironmentVariantsCard
                    key={environment.name}
                    environment={environment}
                >
                    <ConditionallyRender
                        condition={
                            !environment.variants ||
                            environment.variants?.length === 0
                        }
                        show={
                            <>
                                <PermissionButton
                                    variant="outlined"
                                    permission={UPDATE_FEATURE_VARIANTS}
                                    projectId={projectId}
                                >
                                    Add variant
                                </PermissionButton>
                                <ConditionallyRender
                                    condition={feature.environments.some(
                                        ({ name, variants }) =>
                                            name !== environment.name &&
                                            variants?.length
                                    )}
                                    show={
                                        <PermissionButton
                                            variant="outlined"
                                            permission={UPDATE_FEATURE_VARIANTS}
                                            projectId={projectId}
                                        >
                                            Copy variants from
                                        </PermissionButton>
                                    }
                                />
                            </>
                        }
                    />
                </EnvironmentVariantsCard>
            ))}
        </PageContent>
    );
};
