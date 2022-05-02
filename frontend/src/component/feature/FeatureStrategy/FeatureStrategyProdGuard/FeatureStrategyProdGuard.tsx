import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { Alert } from '@mui/material';
import { Checkbox, FormControlLabel } from '@mui/material';
import { PRODUCTION } from 'constants/environmentTypes';
import { IFeatureToggle } from 'interfaces/featureToggle';
import { createPersistentGlobalStateHook } from 'hooks/usePersistentGlobalState';

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

// Store the "always hide" prod guard dialog setting in localStorage.
const localStorageKey = 'useFeatureStrategyProdGuardSettings:v2';

const useFeatureStrategyProdGuardSettings =
    createPersistentGlobalStateHook<IFeatureStrategyProdGuardSettings>(
        localStorageKey,
        { hide: false }
    );
