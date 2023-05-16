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
import {
    IFeatureEnvironmentWithCrEnabled,
    IFeatureVariant,
} from 'interfaces/featureToggle';
import { useMemo, useState } from 'react';
import { EnvironmentVariantsModal } from './EnvironmentVariantsModal/EnvironmentVariantsModal';
import { EnvironmentVariantsCard } from './EnvironmentVariantsCard/EnvironmentVariantsCard';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import { EnvironmentVariantsCopyFrom } from './EnvironmentVariantsCopyFrom/EnvironmentVariantsCopyFrom';
import { PushVariantsButton } from './PushVariantsButton/PushVariantsButton';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { Edit } from '@mui/icons-material';

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
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const { addChange } = useChangeRequestApi();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);

    const [searchValue, setSearchValue] = useState('');
    const [selectedEnvironment, setSelectedEnvironment] =
        useState<IFeatureEnvironmentWithCrEnabled>();
    const [modalOpen, setModalOpen] = useState(false);

    const environments: IFeatureEnvironmentWithCrEnabled[] = useMemo(
        () =>
            feature?.environments?.map(environment => ({
                ...environment,
                crEnabled: isChangeRequestConfigured(environment.name),
            })) || [],
        [feature.environments]
    );

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

    const getCrPayload = (variants: IFeatureVariant[]) => ({
        feature: featureId,
        action: 'patchVariant' as const,
        payload: { variants },
    });

    const updateVariants = async (
        environment: IFeatureEnvironmentWithCrEnabled,
        variants: IFeatureVariant[]
    ) => {
        if (environment.crEnabled) {
            await addChange(
                projectId,
                environment.name,
                getCrPayload(variants)
            );
            refetchChangeRequests();
        } else {
            const environmentVariants = environment.variants ?? [];
            const { patch, error } = getApiPayload(
                environmentVariants,
                variants
            );

            if (patch.length === 0) return;

            if (error) {
                setToastData({
                    type: 'error',
                    title: error,
                });
                return;
            }

            await patchFeatureEnvironmentVariants(
                projectId,
                featureId,
                environment.name,
                patch
            );
        }
        refetchFeature();
    };

    const pushToEnvironments = async (
        variants: IFeatureVariant[],
        selected: IFeatureEnvironmentWithCrEnabled[]
    ) => {
        try {
            const selectedWithCrEnabled = selected.filter(
                ({ crEnabled }) => crEnabled
            );
            const selectedWithCrDisabled = selected.filter(
                ({ crEnabled }) => !crEnabled
            );

            if (selectedWithCrEnabled.length) {
                await Promise.all(
                    selectedWithCrEnabled.map(environment =>
                        addChange(
                            projectId,
                            environment.name,
                            getCrPayload(variants)
                        )
                    )
                );
            }
            if (selectedWithCrDisabled.length) {
                await overrideVariantsInEnvironments(
                    projectId,
                    featureId,
                    variants,
                    selectedWithCrDisabled.map(({ name }) => name)
                );
            }
            refetchChangeRequests();
            refetchFeature();
            const pushTitle = selectedWithCrDisabled.length
                ? `Variants pushed to ${
                      selectedWithCrDisabled.length === 1
                          ? selectedWithCrDisabled[0].name
                          : `${selectedWithCrDisabled.length} environments`
                  }`
                : '';
            const draftTitle = selectedWithCrEnabled.length
                ? `Variants push added to ${
                      selectedWithCrEnabled.length === 1
                          ? `${selectedWithCrEnabled[0].name} draft`
                          : `${selectedWithCrEnabled.length} drafts`
                  }`
                : '';
            const title = `${pushTitle}${
                pushTitle && draftTitle ? '. ' : ''
            }${draftTitle}`;
            setToastData({
                title,
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const editVariants = (environment: IFeatureEnvironmentWithCrEnabled) => {
        setSelectedEnvironment(environment);
        setModalOpen(true);
    };

    const onVariantsConfirm = async (updatedVariants: IFeatureVariant[]) => {
        if (selectedEnvironment) {
            try {
                await updateVariants(selectedEnvironment, updatedVariants);
                setModalOpen(false);
                setToastData({
                    title: selectedEnvironment.crEnabled
                        ? `Variant changes added to draft`
                        : 'Variants updated successfully',
                    type: 'success',
                });
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const onCopyVariantsFrom = async (
        fromEnvironment: IFeatureEnvironmentWithCrEnabled,
        toEnvironment: IFeatureEnvironmentWithCrEnabled
    ) => {
        try {
            const variants = fromEnvironment.variants ?? [];
            await updateVariants(toEnvironment, variants);
            setToastData({
                title: toEnvironment.crEnabled
                    ? 'Variants copy added to draft'
                    : 'Variants copied successfully',
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
            {environments.map(environment => {
                const otherEnvsWithVariants = environments.filter(
                    ({ name, variants }) =>
                        name !== environment.name && variants?.length
                );

                return (
                    <EnvironmentVariantsCard
                        key={environment.name}
                        environment={environment}
                        searchValue={searchValue}
                    >
                        <StyledButtonContainer>
                            <PushVariantsButton
                                current={environment.name}
                                environments={environments}
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
                            <ConditionallyRender
                                condition={Boolean(
                                    environment.variants?.length
                                )}
                                show={
                                    <PermissionIconButton
                                        data-testid="EDIT_VARIANTS_BUTTON"
                                        onClick={() =>
                                            editVariants(environment)
                                        }
                                        permission={
                                            UPDATE_FEATURE_ENVIRONMENT_VARIANTS
                                        }
                                        projectId={projectId}
                                        environmentId={environment.name}
                                        tooltipProps={{
                                            title: 'Edit variants',
                                        }}
                                    >
                                        <Edit />
                                    </PermissionIconButton>
                                }
                                elseShow={
                                    <PermissionButton
                                        data-testid="ADD_VARIANT_BUTTON"
                                        onClick={() =>
                                            editVariants(environment)
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
                                }
                            />
                        </StyledButtonContainer>
                    </EnvironmentVariantsCard>
                );
            })}
            <EnvironmentVariantsModal
                environment={selectedEnvironment}
                open={modalOpen}
                setOpen={setModalOpen}
                getApiPayload={getApiPayload}
                getCrPayload={getCrPayload}
                onConfirm={onVariantsConfirm}
            />
        </PageContent>
    );
};
