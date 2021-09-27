import { Alert } from '@material-ui/lab';
import Dialogue from '../../../../../common/Dialogue';

interface IFeatureStrategiesProductionGuard {
    show: boolean;
    onClick: () => void;
    onClose: () => void;
    primaryButtonText: string;
}

const FeatureStrategiesProductionGuard = ({
    show,
    onClick,
    onClose,
    primaryButtonText,
}: IFeatureStrategiesProductionGuard) => {
    return (
        <Dialogue
            title="Changing production environment!"
            open={show}
            primaryButtonText={primaryButtonText}
            secondaryButtonText="Cancel"
            onClick={onClick}
            onClose={onClose}
        >
            <Alert severity="error">
                WARNING. You are about to make changes to a production
                environment. These changes will affect your customers.
            </Alert>

            <p style={{ marginTop: '1rem' }}>
                Are you sure you want to proceed?
            </p>
        </Dialogue>
    );
};

export default FeatureStrategiesProductionGuard;
