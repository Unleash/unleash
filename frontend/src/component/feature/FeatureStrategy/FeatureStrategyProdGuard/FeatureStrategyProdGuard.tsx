import { getBasePath } from 'utils/format-path';
import Dialogue from '../../../common/Dialogue';
import { Alert } from '@material-ui/lab';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import { PRODUCTION } from 'constants/environmentTypes';
import { IFeatureToggle } from 'interfaces/featureToggle';
import { createPersistentGlobalStateHook } from 'hooks/usePersistentGlobalState';
import { setLocalStorageItem } from 'utils/storage';

interface IFeatureStrategyProdGuardProps {
    open: boolean;
    onClick: () => void;
    onClose: () => void;
    label: string;
    loading: boolean;
}

interface IFeatureStrategyProdGuardSettings {
    hide: boolean;
}

export const FeatureStrategyProdGuard = ({
    open,
    onClose,
    onClick,
    label,
    loading,
}: IFeatureStrategyProdGuardProps) => {
    const [settings, setSettings] = useFeatureStrategyProdGuardSettings();

    const toggleHideSetting = () => {
        setSettings(prev => ({ hide: !prev.hide }));
    };

    return (
        <Dialogue
            title="Changing production environment!"
            primaryButtonText={label}
            disabledPrimaryButton={loading}
            secondaryButtonText="Cancel"
            onClick={onClick}
            onClose={onClose}
            open={open}
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
                    <Checkbox
                        checked={settings.hide}
                        onChange={toggleHideSetting}
                    />
                }
            />
        </Dialogue>
    );
};

// Check if the prod guard dialog should be enabled.
export const useFeatureStrategyProdGuard = (
    feature: IFeatureToggle,
    environmentId: string
): boolean => {
    const [settings] = useFeatureStrategyProdGuardSettings();

    const environment = feature.environments.find(environment => {
        return environment.name === environmentId;
    });

    if (settings.hide) {
        return false;
    }

    return environment?.type === PRODUCTION;
};

export const disableFeatureStrategiesProductionGuard = () => {
    const settings: IFeatureStrategyProdGuardSettings = { hide: true };
    setLocalStorageItem(localStorageKey, settings);
};

// Store the "always hide" prod guard dialog setting in localStorage.
const localStorageKey = `${getBasePath()}:useFeatureStrategyProdGuardSettings:v1`;

const useFeatureStrategyProdGuardSettings =
    createPersistentGlobalStateHook<IFeatureStrategyProdGuardSettings>(
        localStorageKey,
        { hide: false }
    );
