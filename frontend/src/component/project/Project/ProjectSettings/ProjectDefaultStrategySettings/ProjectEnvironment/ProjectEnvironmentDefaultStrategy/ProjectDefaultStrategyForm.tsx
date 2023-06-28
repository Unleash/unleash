import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, styled } from '@mui/material';
import {
    IFeatureStrategy,
    IFeatureStrategyParameters,
    IStrategyParameter,
} from 'interfaces/strategy';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { STRATEGY_FORM_SUBMIT_ID } from 'utils/testIds';
import { useConstraintsValidation } from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { FeatureStrategySegment } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegment';
import { ISegment } from 'interfaces/segment';
import { IFormErrors } from 'hooks/useFormErrors';
import { validateParameterValue } from 'utils/validateParameterValue';
import { useStrategy } from 'hooks/api/getters/useStrategy/useStrategy';
import { useHasProjectEnvironmentAccess } from 'hooks/useHasAccess';
import { FeatureStrategyConstraints } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/FeatureStrategyConstraints';
import { FeatureStrategyType } from 'component/feature/FeatureStrategy/FeatureStrategyType/FeatureStrategyType';
import { FeatureStrategyTitle } from 'component/feature/FeatureStrategy/FeatureStrategyForm/FeatureStrategyTitle/FeatureStrategyTitle';

interface IProjectDefaultStrategyFormProps {
    projectId: string;
    environmentId: string;
    permission: string;
    onSubmit: () => void;
    onCancel?: () => void;
    loading: boolean;
    isChangeRequest?: boolean;
    strategy: Partial<IFeatureStrategy>;
    setStrategy: React.Dispatch<
        React.SetStateAction<Partial<IFeatureStrategy>>
    >;
    segments: ISegment[];
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
    errors: IFormErrors;
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

export const ProjectDefaultStrategyForm = ({
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
}: IProjectDefaultStrategyFormProps) => {
    const hasValidConstraints = useConstraintsValidation(strategy.constraints);
    const access = useHasProjectEnvironmentAccess(
        permission,
        projectId,
        environmentId
    );
    const { strategyDefinition } = useStrategy(strategy?.name);

    const navigate = useNavigate();

    const {
        uiConfig,
        error: uiConfigError,
        loading: uiConfigLoading,
    } = useUiConfig();

    if (uiConfigError) {
        throw uiConfigError;
    }

    if (uiConfigLoading || !strategyDefinition) {
        return null;
    }

    const findParameterDefinition = (name: string): IStrategyParameter => {
        return strategyDefinition.parameters.find(parameterDefinition => {
            return parameterDefinition.name === name;
        })!;
    };

    const validateParameter = (
        name: string,
        value: IFeatureStrategyParameters[string]
    ): boolean => {
        const parameter = findParameterDefinition(name);
        // We don't validate groupId for the default strategy.
        // it will get filled when added to a toggle
        if (name !== 'groupId') {
            const parameterValueError = validateParameterValue(
                parameter,
                value
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
            .map(parameter => parameter.name)
            .map(name => validateParameter(name, strategy.parameters?.[name]))
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
                setTitle={title => {
                    setStrategy(prev => ({
                        ...prev,
                        title,
                    }));
                }}
            />
            <ConditionallyRender
                condition={Boolean(uiConfig.flags.SE)}
                show={
                    <FeatureStrategySegment
                        segments={segments}
                        setSegments={setSegments}
                        projectId={projectId}
                    />
                }
            />
            <FeatureStrategyConstraints
                projectId={projectId}
                environmentId={environmentId}
                strategy={strategy as any}
                setStrategy={setStrategy}
            />
            <StyledHr />
            <FeatureStrategyType
                strategy={strategy as any}
                strategyDefinition={strategyDefinition}
                setStrategy={setStrategy}
                validateParameter={validateParameter}
                errors={errors}
                hasAccess={access}
            />
            <StyledHr />
            <StyledButtons>
                <PermissionButton
                    permission={permission}
                    projectId={projectId}
                    environmentId={environmentId}
                    variant="contained"
                    color="primary"
                    type="submit"
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
                    type="button"
                    color="primary"
                    onClick={onCancel ? onCancel : onDefaultCancel}
                    disabled={loading}
                >
                    Cancel
                </Button>
            </StyledButtons>
        </StyledForm>
    );
};
