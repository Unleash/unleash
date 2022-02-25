import { Checkbox, FormControlLabel } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useState } from 'react';
import Dialogue from '../../../../../common/Dialogue';

export const FEATURE_STRATEGY_PRODUCTION_GUARD_SETTING =
    'FEATURE_STRATEGY_PRODUCTION_GUARD_SETTING';

interface IFeatureStrategiesProductionGuard {
    show: boolean;
    onClick: () => void;
    onClose: () => void;
    primaryButtonText: string;
    loading?: boolean;
}

const FeatureStrategiesProductionGuard = ({
    show,
    onClick,
    onClose,
    primaryButtonText,
    loading,
}: IFeatureStrategiesProductionGuard) => {
    const [checked, setIsChecked] = useState(
        JSON.parse(
            localStorage.getItem(FEATURE_STRATEGY_PRODUCTION_GUARD_SETTING) ||
                'false'
        )
    );
    const handleOnchange = () => {
        setIsChecked(!checked);
        localStorage.setItem(
            FEATURE_STRATEGY_PRODUCTION_GUARD_SETTING,
            (!checked).toString()
        );
    };
    return (
        <Dialogue
            title="Changing production environment!"
            open={show}
            primaryButtonText={primaryButtonText}
            secondaryButtonText="Cancel"
            onClick={onClick}
            onClose={onClose}
            disabledPrimaryButton={loading}
        >
            <Alert severity="error">
                WARNING. You are about to make changes to a production
                environment. These changes will affect your customers.
            </Alert>
            <p style={{ marginTop: '1rem' }}>
                Are you sure you want to proceed?
            </p>
            <FormControlLabel
                label="Don't show again"
                control={
                    <Checkbox checked={checked} onChange={handleOnchange} />
                }
            />
        </Dialogue>
    );
};

export const disableFeatureStrategiesProductionGuard = () => {
    localStorage.setItem(
        FEATURE_STRATEGY_PRODUCTION_GUARD_SETTING,
        String(true)
    );
};

export default FeatureStrategiesProductionGuard;
