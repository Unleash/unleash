import * as jsonpatch from 'fast-json-patch';

import { Button, styled } from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { FormEvent, useEffect, useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import Input from 'component/common/Input/Input';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IFeatureEnvironment, IFeatureVariant } from 'interfaces/featureToggle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { Operation } from 'fast-json-patch';
import { useOverrides } from 'component/feature/FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantModal/VariantOverrides/useOverrides';
import SelectMenu from 'component/common/select';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { OverrideConfig } from 'component/feature/FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantModal/VariantOverrides/VariantOverrides';
import { updateWeight } from 'component/common/util';

const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledInputDescription = styled('p')(({ theme }) => ({
    display: 'flex',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
    '&:not(:first-of-type)': {
        marginTop: theme.spacing(4),
    },
}));

const StyledInputSecondaryDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
}));

const StyledRow = styled('div')(({ theme }) => ({
    display: 'flex',
    rowGap: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        '& > div, .MuiInputBase-root': {
            width: '100%',
        },
    },
}));

const StyledSelectMenu = styled(SelectMenu)(({ theme }) => ({
    minWidth: theme.spacing(20),
    marginRight: theme.spacing(10),
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('sm')]: {
        marginTop: theme.spacing(4),
    },
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

const payloadOptions = [
    { key: 'string', label: 'string' },
    { key: 'json', label: 'json' },
    { key: 'csv', label: 'csv' },
];

enum WeightTypes {
    FIX = 'fix',
    VARIABLE = 'variable',
}

const EMPTY_PAYLOAD = { type: 'string', value: '' };

enum ErrorField {
    NAME = 'name',
    PAYLOAD = 'payload',
}

interface IEnvironmentVariantModalErrors {
    [ErrorField.NAME]?: string;
    [ErrorField.PAYLOAD]?: string;
}

interface IEnvironmentVariantModalProps {
    environment?: IFeatureEnvironment;
    variant?: IFeatureVariant;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refetch: () => void;
}

export const EnvironmentVariantModal = ({
    environment,
    variant,
    open,
    setOpen,
    refetch,
}: IEnvironmentVariantModalProps) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');

    const { patchFeatureEnvironmentVariants, loading } = useFeatureApi();

    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();

    const [name, setName] = useState('');
    const [customPercentage, setCustomPercentage] = useState(false);
    const [percentage, setPercentage] = useState('');
    const [payload, setPayload] = useState(EMPTY_PAYLOAD);
    const [overrides, overridesDispatch] = useOverrides([]);
    const { context } = useUnleashContext();

    const [errors, setErrors] = useState<IEnvironmentVariantModalErrors>({});

    const clearError = (field: ErrorField) => {
        setErrors(errors => ({ ...errors, [field]: undefined }));
    };

    const setError = (field: ErrorField, error: string) => {
        setErrors(errors => ({ ...errors, [field]: error }));
    };

    useEffect(() => {
        setName('');
        setCustomPercentage(false);
        setPercentage('');
        setPayload(EMPTY_PAYLOAD);
        overridesDispatch({ type: 'CLEAR' });
        setErrors({});
    }, [open]);

    const createPatch = (newVariants: IFeatureVariant[]) => {
        return jsonpatch.compare(variants, newVariants);
    };

    const getAddEnvironmentVariantPayload = (): Operation[] => {
        const newVariant: IFeatureVariant = {
            name,
            weight: Number(percentage || 100) * 10,
            weightType: customPercentage
                ? WeightTypes.FIX
                : WeightTypes.VARIABLE,
            stickiness:
                variants?.length > 0 ? variants[0].stickiness : 'default',
            payload: payload.value ? payload : undefined,
            overrides: overrides
                .map(o => ({
                    contextName: o.contextName,
                    values: o.values,
                }))
                .filter(o => o.values && o.values.length > 0),
        };

        const updatedVariants: IFeatureVariant[] = [...variants, newVariant];

        const newVariants = updateWeight(updatedVariants, 1000);

        return createPatch(newVariants);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await patchFeatureEnvironmentVariants(
                projectId,
                featureId,
                environment?.name!,
                getAddEnvironmentVariantPayload()
            );
            setToastData({
                title: 'Variant successfully added!',
                type: 'success',
            });
            refetch();
            setOpen(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const formatApiCode = () => {
        return `curl --location --request PATCH '${
            uiConfig.unleashUrl
        }/api/admin/projects/${projectId}/features/${featureId}/environments/${
            environment?.name
        }/variants' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(
        getAddEnvironmentVariantPayload(),
        undefined,
        2
    )}'`;
    };

    const isNameNotEmpty = (name: string) => name.length;
    const isNameUnique = (name: string) =>
        !environment?.variants?.some(variant => variant.name === name);
    const isValid = isNameNotEmpty(name) && isNameUnique(name);

    const onSetName = (name: string) => {
        clearError(ErrorField.NAME);
        if (!isNameUnique(name)) {
            setError(
                ErrorField.NAME,
                'A variant with that name already exists for this environment.'
            );
        }
        setName(name);
    };

    const onAddOverride = () => {
        if (context.length > 0) {
            overridesDispatch({
                type: 'ADD',
                payload: { contextName: context[0].name, values: [] },
            });
        }
    };

    const editing = Boolean(variant);
    const variants = environment?.variants || [];
    const customPercentageVisible =
        (editing && variants.length > 1) || (!editing && variants.length > 0);

    return (
        <SidebarModal
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label="Add variant"
        >
            <FormTemplate
                loading={loading}
                modal
                title="Add variant"
                description=""
                documentationLink=""
                documentationLinkLabel=""
                formatApiCode={formatApiCode}
            >
                <StyledForm onSubmit={handleSubmit}>
                    <div>
                        <StyledInputDescription>
                            Variant name
                        </StyledInputDescription>
                        <StyledInputSecondaryDescription>
                            This will be used to identify the variant in your
                            code
                        </StyledInputSecondaryDescription>
                        <StyledInput
                            autoFocus
                            label="Variant name"
                            error={Boolean(errors.name)}
                            errorText={errors.name}
                            value={name}
                            onChange={e => onSetName(e.target.value)}
                            required
                        />
                        <ConditionallyRender
                            condition={customPercentageVisible}
                            show={<>custom percentage here</>}
                        />
                        <StyledInputDescription>
                            Payload
                            <HelpIcon tooltip="Passed along with the the variant object." />
                        </StyledInputDescription>
                        <StyledRow>
                            <StyledSelectMenu
                                id="variant-payload-type"
                                name="type"
                                label="Type"
                                value={payload.type}
                                options={payloadOptions}
                                onChange={e =>
                                    setPayload(payload => ({
                                        ...payload,
                                        type: e.target.value,
                                    }))
                                }
                            />
                            <StyledInput
                                id="variant-payload-value"
                                name="variant-payload-value"
                                label="Value"
                                multiline={payload.type !== 'string'}
                                rows={payload.type === 'string' ? 1 : 4}
                                value={payload.value}
                                onChange={e =>
                                    setPayload(payload => ({
                                        ...payload,
                                        value: e.target.value,
                                    }))
                                }
                                placeholder={
                                    payload.type === 'json'
                                        ? '{ "hello": "world" }'
                                        : ''
                                }
                                error={Boolean(errors.payload)}
                                errorText={errors.payload}
                            />
                        </StyledRow>
                        <StyledInputDescription>
                            Overrides
                            <HelpIcon tooltip="Here you can specify which users should get this variant." />
                        </StyledInputDescription>
                        <OverrideConfig
                            overrides={overrides}
                            overridesDispatch={overridesDispatch}
                        />
                        <Button
                            onClick={onAddOverride}
                            variant="outlined"
                            color="primary"
                        >
                            Add override
                        </Button>
                    </div>

                    <StyledButtonContainer>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={!isValid}
                        >
                            Add variant
                        </Button>
                        <StyledCancelButton
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            Cancel
                        </StyledCancelButton>
                    </StyledButtonContainer>
                </StyledForm>
            </FormTemplate>
        </SidebarModal>
    );
};
