import { useState } from 'react';
import type { IStrategy, StrategyFormState } from 'interfaces/strategy';
import type { IFormErrors } from 'hooks/useFormErrors';
import type { ParametersSchema } from 'openapi/index.ts';
import { useUiFlag } from 'hooks/useUiFlag';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import {
    type PayloadSchemaTarget,
    usePayloadSchemaApi,
} from 'hooks/api/actions/usePayloadSchemaApi/usePayloadSchemaApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import {
    useConstraintsValidation,
    validateConstraints,
} from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';
import { validateParameterValue } from 'utils/validateParameterValue';
import {
    hasJsonPayload,
    strategyVariantsAreValid,
} from 'component/feature/StrategyTypes/strategyVariantsValidation';
import {
    parameterFocusKey,
    useFormFocus,
    variantsFocusKey,
} from './formFocus.tsx';

export type FailedVariantsSubmit = Record<string, never>;

export type StrategyFormType =
    | 'featureEnvironmentStrategy'
    | 'projectDefaultStrategy'
    | 'releaseTemplateStrategy';

type UseStrategyFormValidationParams = {
    strategy: StrategyFormState;
    strategyDefinition?: IStrategy;
    errors: IFormErrors;
    strategyFormType?: StrategyFormType;
    payloadSchemaTarget?: PayloadSchemaTarget;
};

export const useStrategyFormValidation = ({
    strategy,
    strategyDefinition,
    errors,
    strategyFormType = 'featureEnvironmentStrategy',
    payloadSchemaTarget,
}: UseStrategyFormValidationParams) => {
    const singlePageStrategyForm = useUiFlag('singlePageStrategyForm');
    const payloadSchemasEnabled = useUiFlag('payloadSchemas');
    const payloadSchemaApi = usePayloadSchemaApi(payloadSchemaTarget);
    const [validatingOnServer, setValidatingOnServer] = useState(false);
    const { validateConstraint } = useFeatureApi();
    const { setToastApiError } = useToast();
    const legacyFormHasValidConstraints = useConstraintsValidation(
        singlePageStrategyForm ? [] : strategy.constraints,
    );
    const [failedVariantsSubmit, setFailedVariantsSubmit] =
        useState<FailedVariantsSubmit>();
    const { focusRegistry, focusFirst } = useFormFocus();

    const groupIdIsOptional =
        strategyDefinition?.name === 'flexibleRollout' &&
        strategyFormType !== 'featureEnvironmentStrategy';
    const fetchedParameters = strategyDefinition?.parameters ?? [];
    const parameterDefinitions = fetchedParameters.map((parameter) =>
        groupIdIsOptional && parameter.name === 'groupId'
            ? { ...parameter, required: false }
            : parameter,
    );

    const validateParameter = (
        name: string,
        value?: ParametersSchema[string],
    ): boolean => {
        const definition = parameterDefinitions.find(
            (parameter) => parameter.name === name,
        );
        if (!definition) return true;

        const parameterValueError = validateParameterValue(definition, value);
        if (parameterValueError) {
            errors.setFormError(name, parameterValueError);
            return false;
        }
        errors.removeFormError(name);
        return true;
    };

    const validateAllParameters = (): boolean => {
        const results = parameterDefinitions.map((parameter) =>
            validateParameter(
                parameter.name,
                strategy.parameters?.[parameter.name],
            ),
        );
        return results.every(Boolean);
    };

    const invalidParameterNames = (): string[] => {
        const invalidParameters = parameterDefinitions.filter((parameter) =>
            validateParameterValue(
                parameter,
                strategy.parameters?.[parameter.name],
            ),
        );
        return invalidParameters.map((parameter) => parameter.name);
    };

    const validateVariants = (): boolean => {
        const variantsAreValid =
            !singlePageStrategyForm ||
            strategyVariantsAreValid(strategy.variants ?? []);
        setFailedVariantsSubmit(variantsAreValid ? undefined : {});
        return variantsAreValid;
    };

    const nonMatchingVariantPayloads = async () => {
        if (!payloadSchemasEnabled || !payloadSchemaApi) return [];
        const payloads = (strategy.variants ?? [])
            .filter(hasJsonPayload)
            .map((variant) => ({
                variantName: variant.name,
                value: variant.payload.value,
            }));
        if (payloads.length === 0) return [];
        return payloadSchemaApi.validateVariantPayloads(payloads);
    };

    const serverChecksPass = async (): Promise<boolean> => {
        if (!singlePageStrategyForm) return true;

        setValidatingOnServer(true);
        try {
            await validateConstraints(
                strategy.constraints ?? [],
                validateConstraint,
            );
            const [firstNonMatching] = await nonMatchingVariantPayloads();
            if (firstNonMatching) {
                setToastApiError(
                    `Variant "${firstNonMatching.variantName}": ${firstNonMatching.error}`,
                );
                return false;
            }
            return true;
        } catch (error) {
            setToastApiError(formatUnknownError(error));
            return false;
        } finally {
            setValidatingOnServer(false);
        }
    };

    const formIsValid = async (): Promise<boolean> => {
        const parametersAreValid = validateAllParameters();
        const variantsAreValid = validateVariants();
        const localChecksPass =
            legacyFormHasValidConstraints &&
            parametersAreValid &&
            variantsAreValid;
        if (!localChecksPass) {
            focusFirst([
                ...invalidParameterNames().map(parameterFocusKey),
                ...(variantsAreValid ? [] : [variantsFocusKey]),
            ]);
            return false;
        }

        return serverChecksPass();
    };

    const clearFailedVariantsSubmit = () => setFailedVariantsSubmit(undefined);

    const legacyFormHasBlockingErrors =
        !singlePageStrategyForm &&
        (!legacyFormHasValidConstraints || errors.hasFormErrors());

    return {
        focusRegistry,
        failedVariantsSubmit,
        clearFailedVariantsSubmit,
        validateParameter,
        formIsValid,
        validatingOnServer,
        legacyFormHasBlockingErrors,
    };
};
