import React, { useState, useContext } from 'react';
import { IFeatureStrategy } from 'interfaces/strategy';
import {
    getFeatureStrategyIcon,
    formatStrategyName,
} from 'utils/strategyNames';
import { FeatureStrategyType } from '../FeatureStrategyType/FeatureStrategyType';
import { FeatureStrategyEnabled } from '../FeatureStrategyEnabled/FeatureStrategyEnabled';
import { FeatureStrategyConstraints } from '../FeatureStrategyConstraints/FeatureStrategyConstraints';
import { Button } from '@material-ui/core';
import {
    FeatureStrategyProdGuard,
    useFeatureStrategyProdGuard,
} from '../FeatureStrategyProdGuard/FeatureStrategyProdGuard';
import { IFeatureToggle } from 'interfaces/featureToggle';
import { useStyles } from './FeatureStrategyForm.styles';
import { formatFeaturePath } from '../FeatureStrategyEdit/FeatureStrategyEdit';
import { useHistory } from 'react-router-dom';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import ConditionallyRender from 'component/common/ConditionallyRender';
import { C } from 'component/common/flags';
import { STRATEGY_FORM_SUBMIT_ID } from 'testIds';
import { FeatureStrategyConstraints2 } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints2/FeatureStrategyConstraints2';
import { useConstraintsValidation } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints2/useConstraintsValidation';
import AccessContext from 'contexts/AccessContext';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';

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
}

export const FeatureStrategyForm = ({
    feature,
    strategy,
    setStrategy,
    environmentId,
    permission,
    onSubmit,
    loading,
}: IFeatureStrategyFormProps) => {
    const styles = useStyles();
    const [showProdGuard, setShowProdGuard] = useState(false);
    const enableProdGuard = useFeatureStrategyProdGuard(feature, environmentId);
    const StrategyIcon = getFeatureStrategyIcon(strategy.name ?? '');
    const strategyName = formatStrategyName(strategy.name ?? '');
    const { hasAccess } = useContext(AccessContext);
    const { push } = useHistory();

    const {
        uiConfig,
        error: uiConfigError,
        loading: uiConfigLoading,
    } = useUiConfig();

    const onCancel = () => {
        push(formatFeaturePath(feature.project, feature.name));
    };

    const onSubmitOrProdGuard = async (event: React.FormEvent) => {
        event.preventDefault();
        if (enableProdGuard) {
            setShowProdGuard(true);
        } else {
            onSubmit();
        }
    };

    const hasValidConstraints = useConstraintsValidation(
        feature.project,
        feature.name,
        strategy.constraints
    );

    if (uiConfigError) {
        throw uiConfigError;
    }

    // Wait for uiConfig to load for the correct uiConfig.flags.CO value.
    if (uiConfigLoading) {
        return null;
    }

    // TODO(olav): Remove uiConfig.flags.CO when new constraints are released.
    const FeatureStrategyConstraintsImplementation = uiConfig.flags.CO
        ? FeatureStrategyConstraints2
        : FeatureStrategyConstraints;
    const disableSubmitButtonFromConstraints = uiConfig.flags.CO
        ? !hasValidConstraints
        : false;

    return (
        <form className={styles.form} onSubmit={onSubmitOrProdGuard}>
            <h2 className={styles.title}>
                <StrategyIcon className={styles.icon} aria-hidden />
                <span className={styles.name}>{strategyName}</span>
            </h2>
            <div>
                <FeatureStrategyEnabled
                    feature={feature}
                    environmentId={environmentId}
                />
            </div>
            <ConditionallyRender
                condition={Boolean(uiConfig.flags[C])}
                show={
                    <div>
                        <FeatureStrategyConstraintsImplementation
                            projectId={feature.project}
                            environmentId={environmentId}
                            strategy={strategy}
                            setStrategy={setStrategy}
                        />
                    </div>
                }
            />
            <FeatureStrategyType
                strategy={strategy}
                setStrategy={setStrategy}
                hasAccess={hasAccess(
                    permission,
                    feature.project,
                    environmentId
                )}
            />
            <div className={styles.buttons}>
                <PermissionButton
                    permission={permission}
                    projectId={feature.project}
                    environmentId={environmentId}
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading || disableSubmitButtonFromConstraints}
                    data-test={STRATEGY_FORM_SUBMIT_ID}
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
