import { Alert, Button, Divider, Link, styled } from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IFeatureEnvironment, IFeatureVariant } from 'interfaces/featureToggle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { Operation } from 'fast-json-patch';
import { CloudCircle } from '@mui/icons-material';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { useChangeRequestInReviewWarning } from 'hooks/useChangeRequestInReviewWarning';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { VariantForm } from './VariantForm/VariantForm';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { UPDATE_FEATURE_ENVIRONMENT_VARIANTS } from 'component/providers/AccessProvider/permissions';
import { WeightType } from 'constants/variantTypes';
import { v4 as uuidv4 } from 'uuid';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { updateWeightEdit } from 'component/common/util';
import { StickinessSelect } from 'component/feature/StrategyTypes/FlexibleStrategy/StickinessSelect/StickinessSelect';
import { useDefaultProjectSettings } from 'hooks/useDefaultProjectSettings';
import Loader from 'component/common/Loader/Loader';

const StyledFormSubtitle = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '& > div': {
        display: 'flex',
        alignItems: 'center',
    },
    marginTop: theme.spacing(-3.5),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    position: 'sticky',
    top: 0,
    zIndex: 2,
}));

const StyledCloudCircle = styled(CloudCircle, {
    shouldForwardProp: prop => prop !== 'deprecated',
})<{ deprecated?: boolean }>(({ theme, deprecated }) => ({
    color: deprecated
        ? theme.palette.neutral.border
        : theme.palette.primary.main,
}));

const StyledName = styled('span', {
    shouldForwardProp: prop => prop !== 'deprecated',
})<{ deprecated?: boolean }>(({ theme, deprecated }) => ({
    color: deprecated
        ? theme.palette.text.secondary
        : theme.palette.text.primary,
    marginLeft: theme.spacing(1.25),
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: theme.fontWeight.bold,
}));

const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledCRAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginTop: theme.spacing(4),
}));

const StyledVariantForms = styled('div')({
    display: 'flex',
    flexDirection: 'column',
});

const StyledStickinessContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(0.5),
}));

const StyledDescription = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1.5),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    margin: theme.spacing(4, 0),
}));

const StyledStickinessSelect = styled(StickinessSelect)(({ theme }) => ({
    minWidth: theme.spacing(20),
    width: '100%',
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: 'auto',
    paddingTop: theme.spacing(4),
    display: 'flex',
    justifyContent: 'flex-end',
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

export type IFeatureVariantEdit = IFeatureVariant & {
    isValid: boolean;
    new: boolean;
    id: string;
};

interface IEnvironmentVariantModalProps {
    environment?: IFeatureEnvironment;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    getApiPayload: (
        variants: IFeatureVariant[],
        newVariants: IFeatureVariant[]
    ) => { patch: Operation[]; error?: string };
    getCrPayload: (variants: IFeatureVariant[]) => {
        feature: string;
        action: 'patchVariant';
        payload: { variants: IFeatureVariant[] };
    };
    onConfirm: (updatedVariants: IFeatureVariant[]) => void;
}

export const EnvironmentVariantsModal = ({
    environment,
    open,
    setOpen,
    getApiPayload,
    getCrPayload,
    onConfirm,
}: IEnvironmentVariantModalProps) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');

    const { uiConfig } = useUiConfig();
    const { context } = useUnleashContext();
    const { defaultStickiness, loading } = useDefaultProjectSettings(projectId);

    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { data } = usePendingChangeRequests(projectId);
    const { changeRequestInReviewOrApproved, alert } =
        useChangeRequestInReviewWarning(data);

    const oldVariants = environment?.variants || [];
    const [variantsEdit, setVariantsEdit] = useState<IFeatureVariantEdit[]>([]);
    const [newVariant, setNewVariant] = useState<string>();

    useEffect(() => {
        if (!loading) {
            setVariantsEdit(
                oldVariants.length
                    ? oldVariants.map(oldVariant => ({
                          ...oldVariant,
                          isValid: true,
                          new: false,
                          id: uuidv4(),
                      }))
                    : [
                          {
                              name: '',
                              weightType: WeightType.VARIABLE,
                              weight: 0,
                              overrides: [],
                              stickiness:
                                  variantsEdit?.length > 0
                                      ? variantsEdit[0].stickiness
                                      : defaultStickiness,
                              new: true,
                              isValid: false,
                              id: uuidv4(),
                          },
                      ]
            );
        }
    }, [open, loading]);

    const updateVariant = (updatedVariant: IFeatureVariantEdit, id: string) => {
        setVariantsEdit(prevVariants =>
            updateWeightEdit(
                prevVariants.map(prevVariant =>
                    prevVariant.id === id ? updatedVariant : prevVariant
                ),
                1000
            )
        );
    };

    const addVariant = () => {
        const id = uuidv4();
        setVariantsEdit(variantsEdit => [
            ...variantsEdit,
            {
                name: '',
                weightType: WeightType.VARIABLE,
                weight: 0,
                overrides: [],
                stickiness:
                    variantsEdit?.length > 0
                        ? variantsEdit[0].stickiness
                        : defaultStickiness,
                new: true,
                isValid: false,
                id,
            },
        ]);
        setNewVariant(id);
    };

    useEffect(() => {
        if (newVariant) {
            const element = document.getElementById(
                `variant-name-input-${newVariant}`
            );
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element?.focus({ preventScroll: true });
            setNewVariant(undefined);
        }
    }, [newVariant]);

    const variants = variantsEdit.map(
        ({ new: _, isValid: __, id: ___, ...rest }) => rest
    );

    const apiPayload = getApiPayload(oldVariants, variants);
    const crPayload = getCrPayload(variants);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onConfirm(variants);
    };

    const formatApiCode = () =>
        isChangeRequest
            ? `curl --location --request POST '${
                  uiConfig.unleashUrl
              }/api/admin/projects/${projectId}/environments/${
                  environment?.name
              }/change-requests' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(crPayload, undefined, 2)}'`
            : `curl --location --request PATCH '${
                  uiConfig.unleashUrl
              }/api/admin/projects/${projectId}/features/${featureId}/environments/${
                  environment?.name
              }/variants' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(apiPayload.patch, undefined, 2)}'`;

    const isValid = variantsEdit.every(({ isValid }) => isValid);

    const hasChangeRequestInReviewForEnvironment =
        changeRequestInReviewOrApproved(environment?.name || '');

    const changeRequestButtonText = hasChangeRequestInReviewForEnvironment
        ? 'Add to existing change request'
        : 'Add change to draft';

    const isChangeRequest = isChangeRequestConfigured(environment?.name || '');

    const stickiness = useMemo(() => {
        if (!loading) {
            return variants[0]?.stickiness || defaultStickiness;
        }
        return '';
    }, [loading, defaultStickiness, JSON.stringify(variants[0] ?? {})]);

    const stickinessOptions = useMemo(
        () => [
            'default',
            ...context.filter(c => c.stickiness).map(c => c.name),
        ],
        [context]
    );
    const options = stickinessOptions.map(c => ({ key: c, label: c }));
    if (!stickinessOptions.includes(stickiness)) {
        options.push({ key: stickiness, label: stickiness });
    }

    const updateStickiness = async (stickiness: string) => {
        setVariantsEdit(prevVariants =>
            prevVariants.map(prevVariant => ({
                ...prevVariant,
                stickiness,
            }))
        );
    };

    const onStickinessChange = (value: string) => {
        updateStickiness(value);
    };

    const [error, setError] = useState<string | undefined>();
    useEffect(() => {
        setError(undefined);
        if (apiPayload.error) {
            setError(apiPayload.error);
        }
    }, [apiPayload.error]);

    const handleClose = () => {
        updateStickiness(defaultStickiness);
        setOpen(false);
    };

    if (loading || stickiness === '') {
        return <Loader />;
    }
    return (
        <SidebarModal open={open} onClose={handleClose} label="">
            <FormTemplate
                modal
                title=""
                description="Variants allows you to return a variant object if the feature toggle is considered enabled for the current request."
                documentationLink="https://docs.getunleash.io/reference/feature-toggle-variants"
                documentationLinkLabel="Feature toggle variants documentation"
                formatApiCode={formatApiCode}
                loading={!open}
            >
                <StyledFormSubtitle>
                    <div>
                        <StyledCloudCircle deprecated={!environment?.enabled} />
                        <StyledName deprecated={!environment?.enabled}>
                            {environment?.name}
                        </StyledName>
                    </div>
                    <PermissionButton
                        data-testid="MODAL_ADD_VARIANT_BUTTON"
                        onClick={addVariant}
                        variant="outlined"
                        permission={UPDATE_FEATURE_ENVIRONMENT_VARIANTS}
                        projectId={projectId}
                        environmentId={environment?.name}
                    >
                        Add variant
                    </PermissionButton>
                </StyledFormSubtitle>
                <StyledForm onSubmit={handleSubmit}>
                    <ConditionallyRender
                        condition={hasChangeRequestInReviewForEnvironment}
                        show={alert}
                        elseShow={
                            <ConditionallyRender
                                condition={Boolean(isChangeRequest)}
                                show={
                                    <StyledCRAlert severity="info">
                                        <strong>Change requests</strong> are
                                        enabled
                                        {environment
                                            ? ` for ${environment.name}`
                                            : ''}
                                        . Your changes need to be approved
                                        before they will be live. All the
                                        changes you do now will be added into a
                                        draft that you can submit for review.
                                    </StyledCRAlert>
                                }
                            />
                        }
                    />
                    <StyledVariantForms>
                        {variantsEdit.map(variant => (
                            <VariantForm
                                key={variant.id}
                                variant={variant}
                                variants={variantsEdit}
                                updateVariant={updatedVariant =>
                                    updateVariant(updatedVariant, variant.id)
                                }
                                removeVariant={() =>
                                    setVariantsEdit(variantsEdit =>
                                        updateWeightEdit(
                                            variantsEdit.filter(
                                                v => v.id !== variant.id
                                            ),
                                            1000
                                        )
                                    )
                                }
                                projectId={projectId}
                                apiPayload={apiPayload}
                            />
                        ))}
                    </StyledVariantForms>
                    <PermissionButton
                        onClick={addVariant}
                        variant="outlined"
                        permission={UPDATE_FEATURE_ENVIRONMENT_VARIANTS}
                        projectId={projectId}
                        environmentId={environment?.name}
                    >
                        Add variant
                    </PermissionButton>
                    <StyledDivider />
                    <ConditionallyRender
                        condition={variantsEdit.length > 0}
                        show={
                            <>
                                <StyledStickinessContainer>
                                    <p>Stickiness</p>
                                </StyledStickinessContainer>
                                <StyledDescription>
                                    By overriding the stickiness you can control
                                    which parameter is used to ensure consistent
                                    traffic allocation across variants.{' '}
                                    <Link
                                        href="https://docs.getunleash.io/reference/feature-toggle-variants"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Read more
                                    </Link>
                                </StyledDescription>
                                <div>
                                    <StyledStickinessSelect
                                        value={stickiness}
                                        label={''}
                                        editable
                                        onChange={e =>
                                            onStickinessChange(e.target.value)
                                        }
                                    />
                                </div>
                            </>
                        }
                        elseShow={
                            <StyledDescription>
                                This environment has no variants. Get started by
                                adding a variant.
                            </StyledDescription>
                        }
                    />

                    <StyledAlert severity="error" hidden={!Boolean(error)}>
                        <strong>Error: </strong>
                        {error}
                    </StyledAlert>

                    <StyledButtonContainer>
                        <Button
                            data-testid="DIALOGUE_CONFIRM_ID"
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={!isValid}
                        >
                            {isChangeRequest
                                ? changeRequestButtonText
                                : 'Save variants'}
                        </Button>
                        <StyledCancelButton onClick={handleClose}>
                            Cancel
                        </StyledCancelButton>
                    </StyledButtonContainer>
                </StyledForm>
            </FormTemplate>
        </SidebarModal>
    );
};
