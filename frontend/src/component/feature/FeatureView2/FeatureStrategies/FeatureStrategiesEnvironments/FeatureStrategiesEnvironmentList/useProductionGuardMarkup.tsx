import FeatureStrategiesProductionGuard from '../FeatureStrategiesProductionGuard/FeatureStrategiesProductionGuard';

interface IUseProductionGuardMarkupProps {
    show: boolean;
    onClick: () => void;
    onClose: () => void;
}

const useProductionGuardMarkup = ({
    show,
    onClick,
    onClose,
}: IUseProductionGuardMarkupProps) => {
    return (
        <FeatureStrategiesProductionGuard
            primaryButtonText="Update strategy"
            show={show}
            onClick={onClick}
            onClose={onClose}
        />
    );
};

export default useProductionGuardMarkup;
