import React, { useState, useContext } from 'react';
import { IFeatureStrategy } from 'interfaces/strategy';
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
import { STRATEGY_FORM_SUBMIT_ID } from 'testIds';
import { useConstraintsValidation } from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';
import AccessContext from 'contexts/AccessContext';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { FeatureStrategyConstraintsCO } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/FeatureStrategyConstraintsCO';
import { FeatureStrategySegment } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegment';
import { ISegment } from 'interfaces/segment';

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
}: IFeatureStrategyFormProps) => {
    const styles = useStyles();
    const [showProdGuard, setShowProdGuard] = useState(false);
    const hasValidConstraints = useConstraintsValidation(strategy.constraints);
    const enableProdGuard = useFeatureStrategyProdGuard(feature, environmentId);
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

    if (uiConfigError) {
        throw uiConfigError;
    }

    // Wait for uiConfig to load for the correct uiConfig.flags.CO value.
    if (uiConfigLoading) {
        return null;
    }

    // TODO(olav): Remove FeatureStrategyConstraints when CO is out.
    const FeatureStrategyConstraintsImplementation = uiConfig.flags.CO
        ? FeatureStrategyConstraintsCO
        : FeatureStrategyConstraints;
    const disableSubmitButtonFromConstraints = uiConfig.flags.CO
        ? !hasValidConstraints
        : false;

    return (
        <form className={styles.form} onSubmit={onSubmitOrProdGuard}>
            <div>
                <FeatureStrategyEnabled
                    feature={feature}
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
            <ConditionallyRender
                condition={Boolean(uiConfig.flags.C)}
                show={
                    <FeatureStrategyConstraintsImplementation
                        projectId={feature.project}
                        environmentId={environmentId}
                        strategy={strategy}
                        setStrategy={setStrategy}
                    />
                }
            />
            <ConditionallyRender
                condition={Boolean(uiConfig.flags.SE || uiConfig.flags.C)}
                show={<hr className={styles.hr} />}
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
            <hr className={styles.hr} />
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
