import { useState } from 'react';
import type { IStrategy, StrategyFormState } from 'interfaces/strategy';
import type { IFormErrors } from 'hooks/useFormErrors';
import type { ParametersSchema } from 'openapi/index.ts';
import { useUiFlag } from 'hooks/useUiFlag';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import {
    useConstraintsValidation,
    validateConstraints,
} from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';
import { validateParameterValue } from 'utils/validateParameterValue';
import { strategyVariantsAreValid } from 'component/feature/StrategyTypes/strategyVariantsValidation';
import {
    parameterFocusKey,
    useFormFocus,
    variantsFocusKey,
} from './formFocus.tsx';

export type FailedVariantsSubmit = Record<string, never>;

type UseStrategyFormValidationParams = {
    strategy: StrategyFormState;
    strategyDefinition?: IStrategy;
    errors: IFormErrors;
};

export const useStrategyFormValidation = ({
    strategy,
    strategyDefinition,
    errors,
}: UseStrategyFormValidationParams) => {
    const singlePageStrategyForm = useUiFlag('singlePageStrategyForm');
    const [validatingConstraints, setValidatingConstraints] = useState(false);
    const { validateConstraint } = useFeatureApi();
    const { setToastApiError } = useToast();
    const legacyFormHasValidConstraints = useConstraintsValidation(
        singlePageStrategyForm ? [] : strategy.constraints,
    );
    const [failedVariantsSubmit, setFailedVariantsSubmit] =
        useState<FailedVariantsSubmit>();
    const { focusRegistry, focusFirst } = useFormFocus();

    const parameterDefinitions = strategyDefinition?.parameters ?? [];

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

    const constraintsAreValidOnServer = async (): Promise<boolean> => {
        if (!singlePageStrategyForm) return true;

        setValidatingConstraints(true);
        try {
            await validateConstraints(
                strategy.constraints ?? [],
                validateConstraint,
            );
            return true;
        } catch (error) {
            setToastApiError(formatUnknownError(error));
            return false;
        } finally {
            setValidatingConstraints(false);
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

        return constraintsAreValidOnServer();
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
        validatingConstraints,
        legacyFormHasBlockingErrors,
    };
};
