import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, styled } from '@mui/material';
import type {
    IFeatureStrategyParameters,
    IStrategyParameter,
    StrategyFormState,
} from 'interfaces/strategy';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { STRATEGY_FORM_SUBMIT_ID } from 'utils/testIds';
import { useConstraintsValidation } from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { FeatureStrategySegment } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegment';
import type { ISegment } from 'interfaces/segment';
import type { IFormErrors } from 'hooks/useFormErrors';
import { validateParameterValue } from 'utils/validateParameterValue';
import { useStrategy } from 'hooks/api/getters/useStrategy/useStrategy';
import { FeatureStrategyConstraints } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/FeatureStrategyConstraints';
import { LegacyFeatureStrategyType } from 'component/feature/FeatureStrategy/FeatureStrategyType/FeatureStrategyType';
import { FeatureStrategyTitle } from 'component/feature/FeatureStrategy/FeatureStrategyForm/FeatureStrategyTitle/FeatureStrategyTitle';
import { StrategyVariants } from 'component/feature/StrategyTypes/StrategyVariants';
import {
    PROJECT_DEFAULT_STRATEGY_WRITE,
    UPDATE_PROJECT,
} from '@server/types/permissions';
import { useAssignableSegments } from 'hooks/api/getters/useSegments/useAssignableSegments';
import { useUiFlag } from 'hooks/useUiFlag';
import { StrategyFormBody } from 'component/feature/FeatureStrategy/FeatureStrategyForm/StrategyFormBody.tsx';

interface IProjectDefaultStrategyFormProps<T extends StrategyFormState> {
    projectId: string;
    environmentId: string;
    permission: string | string[];
    onSubmit: () => void;
    onCancel?: () => void;
    loading: boolean;
    strategy: T;
    setStrategy: React.Dispatch<React.SetStateAction<T>>;
    errors: IFormErrors;
}

interface ILegacyProjectDefaultStrategyFormProps<T extends StrategyFormState>
    extends IProjectDefaultStrategyFormProps<T> {
    segments: ISegment[];
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
}

const StyledForm = styled('form')(({ theme }) => ({
    display: 'grid',
    gap: theme.spacing(2),
}));

const StyledHr = styled('hr')(({ theme }) => ({
    width: '100%',
    height: '1px',
    margin: theme.spacing(2, 0),
    border: 'none',
    background: theme.palette.background.elevation2,
}));

const StyledButtons = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'end',
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(10),
}));

const NewProjectDefaultStrategyForm = <T extends StrategyFormState>({
    projectId,
    environmentId,
    permission,
    onSubmit,
    onCancel,
    loading,
    strategy,
    setStrategy,
    errors,
}: IProjectDefaultStrategyFormProps<T>) => {
    const hasValidConstraints = useConstraintsValidation(strategy.constraints);
    const { strategyDefinition } = useStrategy(strategy?.name);
    const navigate = useNavigate();

    if (!strategyDefinition) {
        return null;
    }

    const onDefaultCancel = () => {
        navigate(`/projects/${projectId}/settings/default-strategy`);
    };

    return (
        <StrategyFormBody
            strategy={strategy}
            setStrategy={setStrategy}
            strategyDefinition={strategyDefinition}
            errors={errors}
            onSubmit={() => {
                onSubmit();
            }}
        >
            <PermissionButton
                permission={permission}
                projectId={projectId}
                environmentId={environmentId}
                variant='contained'
                color='primary'
                type='submit'
                disabled={
                    loading || !hasValidConstraints || errors.hasFormErrors()
                }
                data-testid={STRATEGY_FORM_SUBMIT_ID}
            >
                Save strategy
            </PermissionButton>
            <Button
                type='button'
                color='primary'
                onClick={onCancel ? onCancel : onDefaultCancel}
                disabled={loading}
            >
                Cancel
            </Button>
        </StrategyFormBody>
    );
};

const LegacyProjectDefaultStrategyForm = <T extends StrategyFormState>({
    projectId,
    environmentId,
    permission,
    onSubmit,
    onCancel,
    loading,
    strategy,
    setStrategy,
    segments,
    setSegments,
    errors,
}: ILegacyProjectDefaultStrategyFormProps<T>) => {
    const hasValidConstraints = useConstraintsValidation(strategy.constraints);
    const { strategyDefinition } = useStrategy(strategy?.name);
    const { segments: assignableSegments = [] } = useAssignableSegments();
    const showSegmentSelector =
        assignableSegments.length > 0 || segments.length > 0;

    const navigate = useNavigate();

    if (!strategyDefinition) {
        return null;
    }

    const findParameterDefinition = (name: string): IStrategyParameter => {
        return strategyDefinition.parameters.find((parameterDefinition) => {
            return parameterDefinition.name === name;
        })!;
    };

    const validateParameter = (
        name: string,
        value: IFeatureStrategyParameters[string],
    ): boolean => {
        const parameter = findParameterDefinition(name);
        // We don't validate groupId for the default strategy.
        // it will get filled when added to a toggle
        if (name !== 'groupId') {
            const parameterValueError = validateParameterValue(
                parameter,
                value,
            );
            if (parameterValueError) {
                errors.setFormError(name, parameterValueError);
                return false;
            } else {
                errors.removeFormError(name);
                return true;
            }
        }
        return true;
    };

    const validateAllParameters = (): boolean => {
        return strategyDefinition.parameters
            .map((parameter) => parameter.name)
            .map((name) => validateParameter(name, strategy.parameters?.[name]))
            .every(Boolean);
    };

    const onDefaultCancel = () => {
        navigate(`/projects/${projectId}/settings/default-strategy`);
    };

    const onSubmitWithValidation = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!validateAllParameters()) {
            return;
        } else {
            onSubmit();
        }
    };

    return (
        <StyledForm onSubmit={onSubmitWithValidation}>
            <FeatureStrategyTitle
                title={strategy.title || ''}
                setTitle={(title) => {
                    setStrategy((prev) => ({
                        ...prev,
                        title,
                    }));
                }}
            />

            {showSegmentSelector ? (
                <FeatureStrategySegment
                    segments={segments}
                    setSegments={setSegments}
                    availableSegments={assignableSegments}
                />
            ) : null}
            <FeatureStrategyConstraints
                strategy={strategy as any}
                setStrategy={setStrategy}
            />
            <StyledHr />

            <LegacyFeatureStrategyType
                strategy={strategy as any}
                strategyDefinition={strategyDefinition}
                setStrategy={setStrategy}
                validateParameter={validateParameter}
                errors={errors}
            />
            <ConditionallyRender
                condition={
                    strategy.parameters != null &&
                    'stickiness' in strategy.parameters
                }
                show={
                    <StrategyVariants
                        strategy={strategy}
                        setStrategy={setStrategy}
                        environment={environmentId}
                        projectId={projectId}
                        permission={[
                            PROJECT_DEFAULT_STRATEGY_WRITE,
                            UPDATE_PROJECT,
                        ]}
                    />
                }
            />
            <StyledHr />
            <StyledButtons>
                <PermissionButton
                    permission={permission}
                    projectId={projectId}
                    environmentId={environmentId}
                    variant='contained'
                    color='primary'
                    type='submit'
                    disabled={
                        loading ||
                        !hasValidConstraints ||
                        errors.hasFormErrors()
                    }
                    data-testid={STRATEGY_FORM_SUBMIT_ID}
                >
                    Save strategy
                </PermissionButton>
                <Button
                    type='button'
                    color='primary'
                    onClick={onCancel ? onCancel : onDefaultCancel}
                    disabled={loading}
                >
                    Cancel
                </Button>
            </StyledButtons>
        </StyledForm>
    );
};

export const ProjectDefaultStrategyForm = <T extends StrategyFormState>(
    props: ILegacyProjectDefaultStrategyFormProps<T>,
) => {
    const useConsolidated = useUiFlag('strategyFormConsolidation');
    return useConsolidated ? (
        <NewProjectDefaultStrategyForm {...props} />
    ) : (
        <LegacyProjectDefaultStrategyForm {...props} />
    );
};
