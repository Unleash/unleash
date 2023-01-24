import * as jsonpatch from 'fast-json-patch';

import { Alert, styled, useMediaQuery, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { Search } from 'component/common/Search/Search';
import { updateWeight } from 'component/common/util';
import { UPDATE_FEATURE_ENVIRONMENT_VARIANTS } from 'component/providers/AccessProvider/permissions';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { IFeatureEnvironment, IFeatureVariant } from 'interfaces/featureToggle';
import { useState } from 'react';
import { EnvironmentVariantModal } from './EnvironmentVariantModal/EnvironmentVariantModal';
import { EnvironmentVariantsCard } from './EnvironmentVariantsCard/EnvironmentVariantsCard';
import { VariantDeleteDialog } from './VariantDeleteDialog/VariantDeleteDialog';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import { EnvironmentVariantsCopyFrom } from './EnvironmentVariantsCopyFrom/EnvironmentVariantsCopyFrom';
import { PushVariantsButton } from './PushVariantsButton/PushVariantsButton';

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
    const { setToastData, setToastApiError } = useToast();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature, refetchFeature, loading } = useFeature(
        projectId,
        featureId
    );
    const { patchFeatureEnvironmentVariants, overrideVariantsInEnvironments } =
        useFeatureApi();

    const [searchValue, setSearchValue] = useState('');
    const [selectedEnvironment, setSelectedEnvironment] =
        useState<IFeatureEnvironment>();
    const [selectedVariant, setSelectedVariant] = useState<IFeatureVariant>();
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const createPatch = (
        variants: IFeatureVariant[],
        newVariants: IFeatureVariant[]
    ) => {
        return jsonpatch.compare(variants, newVariants);
    };

    const getApiPayload = (
        variants: IFeatureVariant[],
        newVariants: IFeatureVariant[]
    ): {
        patch: jsonpatch.Operation[];
        error?: string;
    } => {
        const updatedNewVariants = updateWeight(newVariants, 1000);
        return { patch: createPatch(variants, updatedNewVariants) };
    };

    const updateVariants = async (
        environment: IFeatureEnvironment,
        variants: IFeatureVariant[]
    ) => {
        const environmentVariants = environment.variants ?? [];
        const { patch } = getApiPayload(environmentVariants, variants);

        if (patch.length === 0) return;

        await patchFeatureEnvironmentVariants(
            projectId,
            featureId,
            environment.name,
            patch
        );
        refetchFeature();
    };

    const pushToEnvironments = async (
        variants: IFeatureVariant[],
        selected: string[]
    ) => {
        try {
            await overrideVariantsInEnvironments(
                projectId,
                featureId,
                variants,
                selected
            );
            refetchFeature();
            setToastData({
                title: `Variants pushed successfully`,
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const addVariant = (environment: IFeatureEnvironment) => {
        setSelectedEnvironment(environment);
        setSelectedVariant(undefined);
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
        setDeleteOpen(true);
    };

    const onDeleteConfirm = async () => {
        if (selectedEnvironment && selectedVariant) {
            const variants = selectedEnvironment.variants ?? [];

            const updatedVariants = variants.filter(
                ({ name }) => name !== selectedVariant.name
            );

            try {
                await updateVariants(selectedEnvironment, updatedVariants);
                setDeleteOpen(false);
                setToastData({
                    title: `Variant deleted successfully`,
                    type: 'success',
                });
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const onVariantConfirm = async (updatedVariants: IFeatureVariant[]) => {
        if (selectedEnvironment) {
            try {
                await updateVariants(selectedEnvironment, updatedVariants);
                setModalOpen(false);
                setToastData({
                    title: `Variant ${
                        selectedVariant ? 'updated' : 'added'
                    } successfully`,
                    type: 'success',
                });
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const onCopyVariantsFrom = async (
        fromEnvironment: IFeatureEnvironment,
        toEnvironment: IFeatureEnvironment
    ) => {
        try {
            const variants = fromEnvironment.variants ?? [];
            await updateVariants(toEnvironment, variants);
            setToastData({
                title: 'Variants copied successfully',
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onUpdateStickiness = async (
        environment: IFeatureEnvironment,
        updatedVariants: IFeatureVariant[]
    ) => {
        try {
            await updateVariants(environment, updatedVariants);
            setToastData({
                title: 'Variant stickiness updated successfully',
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
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
            {feature.environments.map(environment => {
                const otherEnvsWithVariants = feature.environments.filter(
                    ({ name, variants }) =>
                        name !== environment.name && variants?.length
                );

                return (
                    <EnvironmentVariantsCard
                        key={environment.name}
                        environment={environment}
                        searchValue={searchValue}
                        onEditVariant={(variant: IFeatureVariant) =>
                            editVariant(environment, variant)
                        }
                        onDeleteVariant={(variant: IFeatureVariant) =>
                            deleteVariant(environment, variant)
                        }
                        onUpdateStickiness={(variants: IFeatureVariant[]) =>
                            onUpdateStickiness(environment, variants)
                        }
                    >
                        <StyledButtonContainer>
                            <PushVariantsButton
                                current={environment.name}
                                environments={feature.environments}
                                permission={UPDATE_FEATURE_ENVIRONMENT_VARIANTS}
                                projectId={projectId}
                                onSubmit={selected =>
                                    pushToEnvironments(
                                        environment.variants ?? [],
                                        selected
                                    )
                                }
                            />
                            <EnvironmentVariantsCopyFrom
                                environment={environment}
                                permission={UPDATE_FEATURE_ENVIRONMENT_VARIANTS}
                                projectId={projectId}
                                environmentId={environment.name}
                                onCopyVariantsFrom={onCopyVariantsFrom}
                                otherEnvsWithVariants={otherEnvsWithVariants}
                            />
                            <PermissionButton
                                onClick={() => addVariant(environment)}
                                variant="outlined"
                                permission={UPDATE_FEATURE_ENVIRONMENT_VARIANTS}
                                projectId={projectId}
                                environmentId={environment.name}
                            >
                                Add variant
                            </PermissionButton>
                        </StyledButtonContainer>
                    </EnvironmentVariantsCard>
                );
            })}
            <EnvironmentVariantModal
                environment={selectedEnvironment}
                variant={selectedVariant}
                open={modalOpen}
                setOpen={setModalOpen}
                getApiPayload={getApiPayload}
                onConfirm={onVariantConfirm}
            />
            <VariantDeleteDialog
                variant={selectedVariant}
                open={deleteOpen}
                setOpen={setDeleteOpen}
                onConfirm={onDeleteConfirm}
            />
        </PageContent>
    );
};
