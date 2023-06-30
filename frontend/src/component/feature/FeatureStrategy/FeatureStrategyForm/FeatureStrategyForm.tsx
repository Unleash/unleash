import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, styled } from '@mui/material';
import {
    IFeatureStrategy,
    IFeatureStrategyParameters,
    IStrategyParameter,
} from 'interfaces/strategy';
import { FeatureStrategyType } from '../FeatureStrategyType/FeatureStrategyType';
import { FeatureStrategyEnabled } from './FeatureStrategyEnabled/FeatureStrategyEnabled';
import { FeatureStrategyConstraints } from '../FeatureStrategyConstraints/FeatureStrategyConstraints';
import { IFeatureToggle } from 'interfaces/featureToggle';
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
import { FeatureStrategyChangeRequestAlert } from './FeatureStrategyChangeRequestAlert/FeatureStrategyChangeRequestAlert';
import {
    FeatureStrategyProdGuard,
    useFeatureStrategyProdGuard,
} from '../FeatureStrategyProdGuard/FeatureStrategyProdGuard';
import { formatFeaturePath } from '../FeatureStrategyEdit/FeatureStrategyEdit';
import { useChangeRequestInReviewWarning } from 'hooks/useChangeRequestInReviewWarning';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { useHasProjectEnvironmentAccess } from 'hooks/useHasAccess';
import { FeatureStrategyTitle } from './FeatureStrategyTitle/FeatureStrategyTitle';
import { FeatureStrategyEnabledDisabled } from './FeatureStrategyEnabledDisabled/FeatureStrategyEnabledDisabled';

interface IFeatureStrategyFormProps {
    feature: IFeatureToggle;
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

export const FeatureStrategyForm = ({
    projectId,
    feature,
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
    isChangeRequest,
}: IFeatureStrategyFormProps) => {
    const [showProdGuard, setShowProdGuard] = useState(false);
    const hasValidConstraints = useConstraintsValidation(strategy.constraints);
    const enableProdGuard = useFeatureStrategyProdGuard(feature, environmentId);
    const access = useHasProjectEnvironmentAccess(
        permission,
        projectId,
        environmentId
    );
    const { strategyDefinition } = useStrategy(strategy?.name);

    const { data } = usePendingChangeRequests(feature.project);
    const { changeRequestInReviewOrApproved, alert } =
        useChangeRequestInReviewWarning(data);

    const hasChangeRequestInReviewForEnvironment =
        changeRequestInReviewOrApproved(environmentId || '');

    const changeRequestButtonText = hasChangeRequestInReviewForEnvironment
        ? 'Add to existing change request'
        : 'Add change to draft';

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
        const parameterValueError = validateParameterValue(
            findParameterDefinition(name),
            value
        );
        if (parameterValueError) {
            errors.setFormError(name, parameterValueError);
            return false;
        } else {
            errors.removeFormError(name);
            return true;
        }
    };

    const validateAllParameters = (): boolean => {
        return strategyDefinition.parameters
            .map(parameter => parameter.name)
            .map(name => validateParameter(name, strategy.parameters?.[name]))
            .every(Boolean);
    };

    const onDefaultCancel = () => {
        navigate(formatFeaturePath(feature.project, feature.name));
    };

    const onSubmitWithValidation = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!validateAllParameters()) {
            return;
        }

        if (enableProdGuard && !isChangeRequest) {
            setShowProdGuard(true);
        } else {
            onSubmit();
        }
    };

    return (
        <StyledForm onSubmit={onSubmitWithValidation}>
            <ConditionallyRender
                condition={hasChangeRequestInReviewForEnvironment}
                show={alert}
                elseShow={
                    <ConditionallyRender
                        condition={Boolean(isChangeRequest)}
                        show={
                            <FeatureStrategyChangeRequestAlert
                                environment={environmentId}
                            />
                        }
                    />
                }
            />
            <FeatureStrategyEnabled
                projectId={feature.project}
                featureId={feature.name}
                environmentId={environmentId}
            >
                <ConditionallyRender
                    condition={Boolean(isChangeRequest)}
                    show={
                        <Alert severity="success">
                            This feature toggle is currently enabled in the{' '}
                            <strong>{environmentId}</strong> environment. Any
                            changes made here will be available to users as soon
                            as these changes are approved and applied.
                        </Alert>
                    }
                    elseShow={
                        <Alert severity="success">
                            This feature toggle is currently enabled in the{' '}
                            <strong>{environmentId}</strong> environment. Any
                            changes made here will be available to users as soon
                            as you hit <strong>save</strong>.
                        </Alert>
                    }
                />
            </FeatureStrategyEnabled>
            <StyledHr />
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
                projectId={feature.project}
                environmentId={environmentId}
                strategy={strategy}
                setStrategy={setStrategy}
            />
            <StyledHr />
            <FeatureStrategyType
                strategy={strategy}
                strategyDefinition={strategyDefinition}
                setStrategy={setStrategy}
                validateParameter={validateParameter}
                errors={errors}
                hasAccess={access}
            />
            <StyledHr />
            <FeatureStrategyEnabledDisabled
                enabled={!strategy?.disabled}
                onToggleEnabled={() =>
                    setStrategy(strategyState => ({
                        ...strategyState,
                        disabled: !strategyState.disabled,
                    }))
                }
            />
            <StyledHr />
            <StyledButtons>
                <PermissionButton
                    permission={permission}
                    projectId={feature.project}
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
                    {isChangeRequest
                        ? changeRequestButtonText
                        : 'Save strategy'}
                </PermissionButton>
                <Button
                    type="button"
                    color="primary"
                    onClick={onCancel ? onCancel : onDefaultCancel}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <FeatureStrategyProdGuard
                    open={showProdGuard}
                    onClose={() => setShowProdGuard(false)}
                    onClick={onSubmit}
                    loading={loading}
                    label="Save strategy"
                />
            </StyledButtons>
        </StyledForm>
    );
};
