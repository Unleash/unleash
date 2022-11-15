import { Alert, styled, useMediaQuery, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { Search } from 'component/common/Search/Search';
import { UPDATE_FEATURE_VARIANTS } from 'component/providers/AccessProvider/permissions';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { IFeatureEnvironment, IFeatureVariant } from 'interfaces/featureToggle';
import { useMemo, useState } from 'react';
import { EnvironmentVariantModal } from './EnvironmentVariantModal/EnvironmentVariantModal';
import { EnvironmentVariantsCard } from './EnvironmentVariantsCard/EnvironmentVariantsCard';

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    '& code': {
        fontWeight: theme.fontWeight.bold,
    },
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1.5),
}));

export const FeatureEnvironmentVariants = () => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature, refetchFeature, loading } = useFeature(
        projectId,
        featureId
    );
    const { environments: allEnvironments } = useEnvironments();

    const [searchValue, setSearchValue] = useState('');
    const [selectedEnvironment, setSelectedEnvironment] =
        useState<IFeatureEnvironment>();
    const [selectedVariant, setSelectedVariant] = useState<IFeatureVariant>();
    const [modalOpen, setModalOpen] = useState(false);

    const environments = useMemo(
        () =>
            feature.environments.map(environment => ({
                ...environment,
                deprecated: !allEnvironments.some(
                    ({ name, enabled }) => name === environment.name && enabled
                ),
            })),
        [feature, allEnvironments]
    );

    const addVariant = (environment: IFeatureEnvironment) => {
        setSelectedEnvironment(environment);
        setModalOpen(true);
    };

    const editVariant = (
        environment: IFeatureEnvironment,
        variant: IFeatureVariant
    ) => {
        setSelectedEnvironment(environment);
        setSelectedVariant(variant);
        setModalOpen(true);
    };

    const deleteVariant = (
        environment: IFeatureEnvironment,
        variant: IFeatureVariant
    ) => {
        setSelectedEnvironment(environment);
        setSelectedVariant(variant);
        // TODO: setDeleteOpen(true);
    };

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title="Variants"
                    actions={
                        <ConditionallyRender
                            condition={!isSmallScreen}
                            show={
                                <>
                                    <Search
                                        initialValue={searchValue}
                                        onChange={setSearchValue}
                                    />
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
            {environments.map(environment => {
                const variants = environment.variants ?? [];
                const otherEnvsHaveVariants = feature.environments.some(
                    ({ name, variants }) =>
                        name !== environment.name && variants?.length
                );

                return (
                    <EnvironmentVariantsCard
                        key={environment.name}
                        environment={environment}
                        searchValue={searchValue}
                        onAddVariant={() => addVariant(environment)}
                        onEditVariant={(variant: IFeatureVariant) =>
                            editVariant(environment, variant)
                        }
                        onDeleteVariant={(variant: IFeatureVariant) =>
                            deleteVariant(environment, variant)
                        }
                    >
                        <ConditionallyRender
                            condition={variants.length === 0}
                            show={
                                <StyledButtonContainer>
                                    <PermissionButton
                                        onClick={() => addVariant(environment)}
                                        variant="outlined"
                                        permission={UPDATE_FEATURE_VARIANTS}
                                        projectId={projectId}
                                    >
                                        Add variant
                                    </PermissionButton>
                                    <ConditionallyRender
                                        condition={otherEnvsHaveVariants}
                                        show={
                                            <PermissionButton
                                                variant="outlined"
                                                permission={
                                                    UPDATE_FEATURE_VARIANTS
                                                }
                                                projectId={projectId}
                                            >
                                                Copy variants from
                                            </PermissionButton>
                                        }
                                    />
                                </StyledButtonContainer>
                            }
                        />
                    </EnvironmentVariantsCard>
                );
            })}
            <EnvironmentVariantModal
                environment={selectedEnvironment!}
                variant={selectedVariant}
                open={modalOpen}
                setOpen={setModalOpen}
                refetch={refetchFeature}
            />
        </PageContent>
    );
};
