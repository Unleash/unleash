import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { Alert } from '@mui/material';
import { PRODUCTION } from 'constants/environmentTypes';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import { createLocalStorage } from 'utils/createLocalStorage';

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
    // Плашка Dont Show Again должна отображаться всегда

    // const { value: settings, setValue: setSettings } =
    //     getFeatureStrategyProdGuardSettings();
    // const [hide, setHide] = useState(settings.hide);

    // const toggleHideSetting = () => {
    //     setSettings((prev) => ({ hide: !prev.hide }));
    //     setHide((prev) => !prev);
    // };

    return (
        <Dialogue
            title='Changing production environment!'
            primaryButtonText={label}
            disabledPrimaryButton={loading}
            secondaryButtonText='Cancel'
            onClick={onClick}
            onClose={onClose}
            open={open}
        >
            <Alert severity='error'>
                WARNING. You are about to make changes to a production
                environment. These changes will affect your customers.
            </Alert>
            <p style={{ marginTop: '1rem' }}>
                Are you sure you want to proceed?
            </p>
            {/*<FormControlLabel*/}
            {/*    label="Don't show again"*/}
            {/*    control={*/}
            {/*        <Checkbox checked={hide} onChange={toggleHideSetting} />*/}
            {/*    }*/}
            {/*/>*/}
        </Dialogue>
    );
};

// Check if the prod guard dialog should be enabled.
export const useFeatureStrategyProdGuard = (
    featureOrType: string | IFeatureToggle,
    environmentId?: string,
): boolean => {
    const { value: settings } = getFeatureStrategyProdGuardSettings();

    if (settings.hide) {
        return false;
    }

    if (typeof featureOrType === 'string') {
        return featureOrType === PRODUCTION;
    }

    return featureOrType?.environments?.some(
        (environment) =>
            environment.name === environmentId &&
            environment.type === PRODUCTION,
    );
};

// Store the "always hide" prod guard dialog setting in localStorage.
const localStorageKey = 'useFeatureStrategyProdGuardSettings:v2';

const getFeatureStrategyProdGuardSettings = () =>
    createLocalStorage<IFeatureStrategyProdGuardSettings>(localStorageKey, {
        hide: false,
    });

export const isProdGuardEnabled = (type: string) => {
    const { value: settings } = getFeatureStrategyProdGuardSettings();
    return type === PRODUCTION && !settings.hide;
};
