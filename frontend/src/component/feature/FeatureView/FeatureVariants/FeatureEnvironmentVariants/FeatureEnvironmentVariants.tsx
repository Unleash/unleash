import * as jsonpatch from 'fast-json-patch';

import {
    Alert,
    FormControlLabel,
    styled,
    Switch,
    useMediaQuery,
    useTheme,
} from '@mui/material';
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
import { useEffect, useState } from 'react';
import { EnvironmentVariantModal } from './EnvironmentVariantModal/EnvironmentVariantModal';
import { EnvironmentVariantsCard } from './EnvironmentVariantsCard/EnvironmentVariantsCard';
import { VariantDeleteDialog } from './VariantDeleteDialog/VariantDeleteDialog';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import { EnvironmentVariantsCopyFrom } from './EnvironmentVariantsCopyFrom/EnvironmentVariantsCopyFrom';
import { dequal } from 'dequal';

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
    const { patchFeatureEnvironmentVariants } = useFeatureApi();

    const [searchValue, setSearchValue] = useState('');
    const [selectedEnvironment, setSelectedEnvironment] =
        useState<IFeatureEnvironment>();
    const [selectedVariant, setSelectedVariant] = useState<IFeatureVariant>();
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [perEnvironment, setPerEnvironment] = useState(false);

    const envSpecificVariants = !feature.environments.reduce(
        (acc, { variants }) =>
            acc && dequal(feature.environments[0].variants, variants),
        true
    );

    useEffect(() => {
        if (envSpecificVariants) {
            setPerEnvironment(envSpecificVariants);
        }
    }, [envSpecificVariants]);

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
        try {
            const updatedNewVariants = updateWeight(newVariants, 1000);
            return { patch: createPatch(variants, updatedNewVariants) };
        } catch (error: unknown) {
            return { patch: [], error: formatUnknownError(error) };
        }
    };

    const updateVariants = async (
        variants: IFeatureVariant[],
        environment?: IFeatureEnvironment
    ) => {
        const environmentVariants =
            (environment
                ? environment.variants
                : feature.environments[0].variants) ?? [];
        const { patch } = getApiPayload(environmentVariants, variants);

        if (patch.length === 0) return;

        await patchFeatureEnvironmentVariants(
            projectId,
            featureId,
            patch,
            environment?.name
        );
        refetchFeature();
    };

    const addVariant = (environment?: IFeatureEnvironment) => {
        setSelectedEnvironment(environment);
        setSelectedVariant(undefined);
        setModalOpen(true);
    };

    const editVariant = (
        variant: IFeatureVariant,
        environment?: IFeatureEnvironment
    ) => {
        setSelectedEnvironment(environment);
        setSelectedVariant(variant);
        setModalOpen(true);
    };

    const deleteVariant = (
        variant: IFeatureVariant,
        environment?: IFeatureEnvironment
    ) => {
        setSelectedEnvironment(environment);
        setSelectedVariant(variant);
        setDeleteOpen(true);
    };

    const onDeleteConfirm = async () => {
        if (selectedVariant) {
            const variants =
                (selectedEnvironment
                    ? selectedEnvironment.variants
                    : feature.environments[0].variants) ?? [];

            const updatedVariants = variants.filter(
                ({ name }) => name !== selectedVariant.name
            );

            try {
                await updateVariants(updatedVariants, selectedEnvironment);
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
        try {
            await updateVariants(updatedVariants, selectedEnvironment);
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
    };

    const onCopyVariantsFrom = async (
        fromEnvironment: IFeatureEnvironment,
        toEnvironment: IFeatureEnvironment
    ) => {
        try {
            const variants = fromEnvironment.variants ?? [];
            await updateVariants(variants, toEnvironment);
            setToastData({
                title: 'Variants copied successfully',
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onUpdateStickiness = async (
        updatedVariants: IFeatureVariant[],
        environment?: IFeatureEnvironment
    ) => {
        try {
            await updateVariants(updatedVariants, environment);
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
                        <>
                            <ConditionallyRender
                                condition={!isSmallScreen}
                                show={
                                    <Search
                                        initialValue={searchValue}
                                        onChange={setSearchValue}
                                    />
                                }
                            />
                            <FormControlLabel
                                data-loading
                                label="Per environment"
                                labelPlacement="start"
                                control={
                                    <Switch
                                        checked={perEnvironment}
                                        onChange={() =>
                                            setPerEnvironment(!perEnvironment)
                                        }
                                        color="primary"
                                        disabled={envSpecificVariants}
                                    />
                                }
                            />
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
            <StyledAlert severity="info">
                Variants allows you to return a variant object if the feature
                toggle is considered enabled for the current request. When using
                variants you should use the <code>getVariant()</code> method in
                the Client SDK.
            </StyledAlert>
            <ConditionallyRender
                condition={Boolean(feature.environments.length)}
                show={
                    <ConditionallyRender
                        condition={perEnvironment}
                        show={feature.environments.map(environment => {
                            const otherEnvsWithVariants =
                                feature.environments.filter(
                                    ({ name, variants }) =>
                                        name !== environment.name &&
                                        variants?.length
                                );

                            return (
                                <EnvironmentVariantsCard
                                    key={environment.name}
                                    environment={environment}
                                    searchValue={searchValue}
                                    onEditVariant={(variant: IFeatureVariant) =>
                                        editVariant(variant, environment)
                                    }
                                    onDeleteVariant={(
                                        variant: IFeatureVariant
                                    ) => deleteVariant(variant, environment)}
                                    onUpdateStickiness={(
                                        variants: IFeatureVariant[]
                                    ) =>
                                        onUpdateStickiness(
                                            variants,
                                            environment
                                        )
                                    }
                                >
                                    <StyledButtonContainer>
                                        <EnvironmentVariantsCopyFrom
                                            environment={environment}
                                            permission={
                                                UPDATE_FEATURE_ENVIRONMENT_VARIANTS
                                            }
                                            projectId={projectId}
                                            environmentId={environment.name}
                                            onCopyVariantsFrom={
                                                onCopyVariantsFrom
                                            }
                                            otherEnvsWithVariants={
                                                otherEnvsWithVariants
                                            }
                                        />
                                        <PermissionButton
                                            onClick={() =>
                                                addVariant(environment)
                                            }
                                            variant="outlined"
                                            permission={
                                                UPDATE_FEATURE_ENVIRONMENT_VARIANTS
                                            }
                                            projectId={projectId}
                                            environmentId={environment.name}
                                        >
                                            Add variant
                                        </PermissionButton>
                                    </StyledButtonContainer>
                                </EnvironmentVariantsCard>
                            );
                        })}
                        elseShow={
                            <EnvironmentVariantsCard
                                global
                                environment={feature.environments[0]}
                                searchValue={searchValue}
                                onEditVariant={(variant: IFeatureVariant) =>
                                    editVariant(variant)
                                }
                                onDeleteVariant={(variant: IFeatureVariant) =>
                                    deleteVariant(variant)
                                }
                                onUpdateStickiness={(
                                    variants: IFeatureVariant[]
                                ) => onUpdateStickiness(variants)}
                            >
                                <StyledButtonContainer>
                                    <PermissionButton
                                        onClick={() => addVariant()}
                                        variant="outlined"
                                        permission={
                                            UPDATE_FEATURE_ENVIRONMENT_VARIANTS
                                        }
                                        projectId={projectId}
                                        environmentId={
                                            feature.environments[0]?.name
                                        }
                                    >
                                        Add variant
                                    </PermissionButton>
                                </StyledButtonContainer>
                            </EnvironmentVariantsCard>
                        }
                    />
                }
                elseShow={
                    <StyledAlert severity="info" data-loading>
                        Variants needs at least one environment.
                    </StyledAlert>
                }
            />
            <EnvironmentVariantModal
                global={!Boolean(selectedEnvironment)}
                environment={selectedEnvironment ?? feature.environments[0]}
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
