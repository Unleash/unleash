import React, { useState, useContext } from 'react';
import {
    IFeatureStrategy,
    IFeatureStrategyParameters,
    IStrategyParameter,
} from 'interfaces/strategy';
import { FeatureStrategyType } from '../FeatureStrategyType/FeatureStrategyType';
import { FeatureStrategyEnabled } from '../FeatureStrategyEnabled/FeatureStrategyEnabled';
import { FeatureStrategyConstraints } from '../FeatureStrategyConstraints/FeatureStrategyConstraints';
import { Button } from '@mui/material';
import {
    FeatureStrategyProdGuard,
    useFeatureStrategyProdGuard,
} from '../FeatureStrategyProdGuard/FeatureStrategyProdGuard';
import { IFeatureToggle } from 'interfaces/featureToggle';
import { useStyles } from './FeatureStrategyForm.styles';
import { formatFeaturePath } from '../FeatureStrategyEdit/FeatureStrategyEdit';
import { useNavigate } from 'react-router-dom';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { STRATEGY_FORM_SUBMIT_ID } from 'utils/testIds';
import { useConstraintsValidation } from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';
import AccessContext from 'contexts/AccessContext';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { FeatureStrategySegment } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegment';
import { ISegment } from 'interfaces/segment';
import { IFormErrors } from 'hooks/useFormErrors';
import { validateParameterValue } from 'utils/validateParameterValue';
import { useStrategy } from 'hooks/api/getters/useStrategy/useStrategy';

interface IFeatureStrategyFormProps {
    feature: IFeatureToggle;
    environmentId: string;
    permission: string;
    onSubmit: () => void;
    loading: boolean;
    strategy: Partial<IFeatureStrategy>;
    setStrategy: React.Dispatch<
        React.SetStateAction<Partial<IFeatureStrategy>>
    >;
    segments: ISegment[];
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
    errors: IFormErrors;
}

export const FeatureStrategyForm = ({
    feature,
    environmentId,
    permission,
    onSubmit,
    loading,
    strategy,
    setStrategy,
    segments,
    setSegments,
    errors,
}: IFeatureStrategyFormProps) => {
    const { classes: styles } = useStyles();
    const [showProdGuard, setShowProdGuard] = useState(false);
    const hasValidConstraints = useConstraintsValidation(strategy.constraints);
    const enableProdGuard = useFeatureStrategyProdGuard(feature, environmentId);
    const { hasAccess } = useContext(AccessContext);
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

    const onCancel = () => {
        navigate(formatFeaturePath(feature.project, feature.name));
    };

    const onSubmitWithValidation = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!validateAllParameters()) {
            return;
        } else if (enableProdGuard) {
            setShowProdGuard(true);
        } else {
            onSubmit();
        }
    };

    return (
        <form className={styles.form} onSubmit={onSubmitWithValidation}>
            <div>
                <FeatureStrategyEnabled
                    projectId={feature.project}
                    featureId={feature.name}
                    environmentId={environmentId}
                />
            </div>
            <hr className={styles.hr} />
            <ConditionallyRender
                condition={Boolean(uiConfig.flags.SE)}
                show={
                    <FeatureStrategySegment
                        segments={segments}
                        setSegments={setSegments}
                    />
                }
            />
            <FeatureStrategyConstraints
                projectId={feature.project}
                environmentId={environmentId}
                strategy={strategy}
                setStrategy={setStrategy}
            />
            <hr className={styles.hr} />
            <FeatureStrategyType
                strategy={strategy}
                strategyDefinition={strategyDefinition}
                setStrategy={setStrategy}
                validateParameter={validateParameter}
                errors={errors}
                hasAccess={hasAccess(
                    permission,
                    feature.project,
                    environmentId
                )}
            />
            <hr className={styles.hr} />
            <div className={styles.buttons}>
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
                    Save strategy
                </PermissionButton>
                <Button
                    type="button"
                    color="secondary"
                    onClick={onCancel}
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
            </div>
        </form>
    );
};
